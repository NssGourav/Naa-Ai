import re
import os
import spacy
import pytextrank
import pdfplumber
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer

nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("textrank")

class NLPPipeline:
    def __init__(self):
        self.header_footer_patterns = [
            r"Page \d+ of \d+",
            r"Newton School of Technology",
            r"Lecture \d+",
            r"Confidential",
            r"Copyright ©.*",
            r"NST - Proprietary",
            r"www\.newtonschool\.co"
        ]

    def clean_text(self, text):
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            is_noise = False
            for pattern in self.header_footer_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    is_noise = True
                    break
            if not is_noise and line:
                line = re.sub(r'\s+\d+$', '', line)
                cleaned_lines.append(line)
        return "\n".join(cleaned_lines)

    def extract_and_structure(self, pdf_path):
        filename = os.path.basename(pdf_path).replace('.pdf', '').replace('_', ' ').replace('-', ' ')
        structured_data = {
            "title": filename.title(),
            "pages": [],
            "all_text": ""
        }
        
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                raw_text = page.extract_text()
                if not raw_text:
                    continue
                
                cleaned_text = self.clean_text(raw_text)
                lines = [l.strip() for l in cleaned_text.split('\n') if l.strip()]
                
                # Improve title detection: look for first multi-word line that isn't just a number
                if structured_data["title"] == filename.title() and lines:
                    for line in lines[:3]: # check first 3 lines
                        if len(line) > 5 and not re.match(r'^\d+$', line):
                            structured_data["title"] = line
                            break

                page_data = {
                    "page_num": i + 1,
                    "content": cleaned_text,
                    "headings": self.detect_headings(lines)
                }
                structured_data["pages"].append(page_data)
                structured_data["all_text"] += cleaned_text + "\n"

        return structured_data

    def detect_headings(self, lines):
        headings = []
        for i, line in enumerate(lines):
            words = line.split()
            if 0 < len(words) < 8:
                if line.isupper() or (line.istitle() and not any(char.isdigit() for char in line)):
                    headings.append(line)
            elif line.endswith(':') and len(line) < 50:
                 headings.append(line.rstrip(':'))
        return list(dict.fromkeys(headings))

    def get_summary(self, text, limit_sentences=6):
        try:
            doc = nlp(text[:100000])
            summary_sentences = [sent.text.strip() for sent in doc._.textrank.summary(limit_phrases=15, limit_sentences=limit_sentences)]
            
            # Detect links to include at the bottom
            links = list(set(re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)))
            
            markdown_summary = "### Key Takeaways\n\n"
            for sent in summary_sentences:
                # Remove links from the takeaway text for a cleaner look
                clean_sent = re.sub(r'https?://[^\s<>"]+|www\.[^\s<>"]+', '', sent).strip()
                # Remove trailing noise like "Sheet link:" or "DIY:"
                clean_sent = re.sub(r'(Sheet link:|DIY:|Context:|Note:)$', '', clean_sent, flags=re.IGNORECASE).strip()
                
                if len(clean_sent) > 20:
                    # Logic to handle points that might have been combined (e.g. split on bullet characters)
                    # This helps when the text extractor combines lines.
                    sub_points = re.split(r'\s+[\u2022\u25cf\*\-]\s+', clean_sent)
                    for sub_p in sub_points:
                        sub_p = sub_p.strip()
                        if len(sub_p) > 10:
                            # Final cleaning of non-ASCII bullets at start
                            sub_p = re.sub(r'^[\u2022\u25cf\*\-\s]+', '', sub_p)
                            markdown_summary += f"- {sub_p}\n"
            
            if links:
                markdown_summary += "\n\n### 🔗 Helpful Links\n\n"
                for link in links[:5]:
                    markdown_summary += f"- [{link}]({link if link.startswith('http') else 'https://' + link})\n"
                    
            return markdown_summary
        except Exception as e:
            return f"Summary generation failed: {str(e)}"

    def get_keywords(self, text, top_n=12):
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1,2))
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]
        
        keyword_scores = zip(feature_names, scores)
        sorted_keywords = sorted(keyword_scores, key=lambda x: x[1], reverse=True)
        return [kw for kw, score in sorted_keywords[:top_n]]

    def generate_exam_notes(self, structured_data):
        notes = []
        # Support more bullet types and numbered lists
        bullet_regex = r'^(\u25cf|\u25cb|\u25a0|\u25b8|\u25b9|\u27a2|\u2022|[\-\*\>\u27a4])|^\(?\d+[\.\)]|^\(?[a-zA-Z][\.\)]'
        context_keywords = ["why", "context:", "note:", "definition:", "key concept:", "important:", "remember:", "note that"]
        
        for page in structured_data["pages"]:
            page_points = []
            lines = page["content"].split('\n')
            current_heading = "Key Discussion"
            
            for line in lines:
                line_clean = line.strip()
                if not line_clean or len(line_clean) < 5:
                    continue
                    
                if line_clean in page["headings"]:
                    current_heading = line_clean
                    continue
                    
                is_bullet = re.match(bullet_regex, line_clean)
                has_context = any(kw in line_clean.lower() for kw in context_keywords)
                has_definition = any(x in line_clean.lower() for x in [" refers to ", " is defined as ", " consists of ", " involves ", " means "])
                
                # Check if it's an important sentence (lengthy but not a paragraph)
                is_significant = 20 < len(line_clean) < 200 and line_clean[0].isupper() and line_clean.endswith(('.', '?', ':'))

                if is_bullet or has_context or has_definition or is_significant:
                    page_points.append({"heading": current_heading, "point": line_clean})
            
            # --- Fallback Logic ---
            # If no points found but page has text, extract top 2 sentences as summary points
            if not page_points and len(page["content"].strip()) > 50:
                try:
                    doc = nlp(page["content"][:2000])
                    summary_sents = [sent.text.strip() for sent in doc._.textrank.summary(limit_sentences=2)]
                    for sent in summary_sents:
                        page_points.append({"heading": "Summary Point", "point": sent})
                except Exception:
                    pass

            if page_points:
                notes.append({
                    "page": page["page_num"],
                    "content": page_points
                })
        return notes


