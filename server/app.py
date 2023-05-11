import transformers
from flask import Flask, request, jsonify
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)

# Load pre-trained models and tokenizers for sentiment analysis and toxicity detection
sentiment_model = pipeline('sentiment-analysis')
toxicity_tokenizer = AutoTokenizer.from_pretrained('unitary/toxic-bert')
toxicity_model = AutoModelForSequenceClassification.from_pretrained('unitary/toxic-bert')

@app.route('/sentiment_analysis', methods=['POST'])
def sentiment_analysis():
    text = request.form['text']

    sentiment_result = sentiment_model(text)[0]
    sentiment = sentiment_result['label']
    score = sentiment_result['score']

    # Perform toxicity detection
    toxicity_inputs = toxicity_tokenizer(text, return_tensors='pt')
    toxicity_outputs = toxicity_model(**toxicity_inputs)
    toxicity_score = toxicity_outputs.logits.softmax(dim=-1)[0][1].item()

    response = {
        'sentiment': sentiment,
        'score': score,
        'toxicity_score': toxicity_score,
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run()
