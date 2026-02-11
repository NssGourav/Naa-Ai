from nlp_pipeline import NLPPipeline

def test_pipeline():
    pipeline = NLPPipeline()
    sample_text = """
    Neural Networks
    Introduction to Multi-Layer Perceptrons.
    Newton School of Technology
    
    A Neural Network is a series of algorithms that endeavors to recognize underlying relationships in a set of data.
    
    Key Components:
    - Neurons: Basic units of computation.
    - Synapses: Connections between neurons.
    - Activation Functions: Introduce non-linearity.
    
    Summary of Training:
    Training refers to the process of adjusting weights using backpropagation.
    Page 1 of 10
    """
    
    cleaned = pipeline.clean_text(sample_text)
    print(cleaned)
    
    keywords = pipeline.get_keywords(cleaned)
    print(keywords)
    
    summary = pipeline.get_summary(cleaned, limit_sentences=2)
    print(summary)
    
    dummy_structured = {
        "pages": [{"page_num": 1, "content": cleaned, "headings": ["Neural Networks", "Key Components"]}]
    }
    notes = pipeline.generate_exam_notes(dummy_structured)
    print(notes)

if __name__ == "__main__":
    test_pipeline()
