import os
import sys
from nlp_pipeline import NLPPipeline

def test_nlp():
    nlp = NLPPipeline()
    
    summary = nlp.get_summary(mock_data["all_text"], limit_sentences=2)
    print(f"Summary: {summary}")
    
    keywords = nlp.get_keywords(mock_data["all_text"])
    print(f"Keywords: {keywords}")
    
    notes = nlp.generate_exam_notes(mock_data)
    print(f"Notes: {notes}")
    
    answer = nlp.get_answer("What is Kubernetes?", mock_data)
    print(f"Chat Answer: {answer}")
    assert "Kubernetes" in answer

if __name__ == "__main__":
    test_nlp()
