# routes.py

from app_init import app, db, github  # Absolute imports
from flask import redirect, url_for, request, jsonify, session, send_file, current_app
from authlib.integrations.flask_client import OAuthError
from models import QuizSet, Question, EditorContent, FurtherExplanation, User  # Absolute imports
from scraping_helpers import process_question, process_pinoybix_question, process_examveda_question, process_examprimer_question, fetch_discussion_comments  # Absolute imports
import config  # Absolute imports
import random
from g4f import Provider, models
from langchain.llms.base import LLM
from langchain_g4f import G4FLLM
import json
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from html.parser import HTMLParser
from models import Attempt
from datetime import datetime
from pytz import timezone
import re
import io

providers_to_try = [
    Provider.Bing,
    Provider.ChatBase,
    Provider.ChatgptAi,
    Provider.FreeGpt,
    Provider.GPTalk,
    Provider.GptForLove,
    Provider.GptGo,
    Provider.You,
]

# The MLStripper class and strip_tags function
class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = io.StringIO()

    def handle_data(self, d):
        self.text.write(d)

    def get_data(self):
        return self.text.getvalue()

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

@app.route('/api', methods=['GET'])
def home():
    return {"status": "success", "message": "Your application is running. Use /api/startScraping endpoint to start scraping."}

@app.route('/api/startScraping', methods=['POST'])
def start_scraping():
    data = request.json
    quiz_title = data.get('title', 'New Quiz Set')
    raw_urls = data.get('rawUrls', '')
    urls_input = data.get('urls', [])
    new_quiz_set = QuizSet(title=quiz_title, raw_urls=raw_urls, urls=json.dumps(urls_input))
    db.session.add(new_quiz_set)
    db.session.commit()

    global_question_counter = 1

    # Process URLs and add questions
    for url_set in data['urls']:
        if isinstance(url_set, dict):
            base_url = url_set.get('base_url', '')
            if 'indiabix' in base_url:
                start_url = int(url_set.get('start_url', 1))
                end_url = int(url_set.get('end_url', start_url))
                for url_number in range(start_url, end_url + 1):
                    global_question_counter = process_question(base_url, url_number, global_question_counter, new_quiz_set.id)
            elif 'pinoybix' in base_url:
                global_question_counter = process_pinoybix_question(base_url, global_question_counter, new_quiz_set.id, db, Question)
            elif 'examveda' in base_url:
                start_page = int(url_set.get('start_page', 1))
                end_page = int(url_set.get('end_page', 10))
                global_question_counter = process_examveda_question(base_url, start_page, end_page, global_question_counter, new_quiz_set.id, db, Question)
            elif 'web.archive.org' in base_url:
                global_question_counter = process_examprimer_question(base_url, global_question_counter, new_quiz_set.id, db, Question)
        elif isinstance(url_set, str):
            if "pinoybix" in url_set:
                global_question_counter = process_pinoybix_question(url_set, global_question_counter, new_quiz_set.id, db, Question)
            elif "indiabix" in url_set:
                global_question_counter = process_question(url_set, global_question_counter, new_quiz_set.id)
            elif "examveda" in url_set:
                global_question_counter = process_examveda_question(url_set, 1, 10, global_question_counter, new_quiz_set.id, db, Question)
            elif "web.archive.org" in url_set:
                global_question_counter = process_examprimer_question(url_set, global_question_counter, new_quiz_set.id, db, Question)

    return jsonify({"message": "Scraping completed.", "quiz_set_id": str(new_quiz_set.id)}), 200

@app.route('/api/getQuestionsByQuizSet/<string:quiz_set_id>', methods=['GET'])
def get_questions_by_quiz_set(quiz_set_id):
    print(f"Fetching questions for Quiz Set ID: {quiz_set_id}")  # Debug log
    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).order_by(Question.order).all()

    print(f"Found {len(questions)} questions for Quiz Set ID: {quiz_set_id}")  # Debugging: check number of questions found

    return jsonify([{
        'id': question.id,
        'order': question.order,  # Include the order field
        'text': question.text,
        'options': question.options,
        'answer': question.answer,
        'url': question.url,
        'explanation': question.explanation,
        'discussion_link': question.discussion_link,
        'favorite': question.favorite,
        'user_selected_option': question.user_selected_option
    } for question in questions])

@app.route('/api/getQuizSets', methods=['GET'])
def get_quiz_sets():
    quiz_sets = QuizSet.query.all()
    ph_tz = timezone('Asia/Manila')
    result = []
    for qs in quiz_sets:
        total_questions = len(qs.questions)
        unanswered_questions = sum(1 for q in qs.questions if q.user_selected_option is None)
        last_updated = qs.last_updated.astimezone(ph_tz) if qs.last_updated else None
        result.append({
            'id': qs.id,
            'title': qs.title,
            'score': qs.score,
            'attempts': len(qs.attempts_list),
            'average_score': qs.average_score,
            'latest_score': qs.latest_score,
            'total_questions': total_questions,
            'unanswered_questions': unanswered_questions,
            'finished': qs.finished,
            'progress': qs.progress,
            'last_updated': last_updated.isoformat() if last_updated else None,
        })
    return jsonify(result)

@app.route('/api/renameQuizSet/<string:quiz_set_id>', methods=['PUT'])
def rename_quiz_set(quiz_set_id):
    data = request.json
    new_title = data.get('new_title')
    quiz_set = db.session.query(QuizSet).get(quiz_set_id)
    if quiz_set:
        quiz_set.title = new_title
        db.session.commit()
        return jsonify({'message': 'Quiz set title updated successfully'}), 200
    return jsonify({'message': 'Quiz set not found'}), 

@app.route('/api/getQuestions', methods=['GET'])
def get_questions():
    questions = Question.query.all()
    return jsonify([{...} for question in questions])  # Unchanged

@app.route('/api/getFavorites/<string:quiz_set_id>', methods=['GET'])
def get_favorites(quiz_set_id):
    favorites = Question.query.filter_by(quiz_set_id=quiz_set_id, favorite=True).all()
    favorites_list = [{
        'id': question.id,
        'text': question.text,
        'options': question.options,
        'answer': question.answer,
        'url': question.url,
        'explanation': question.explanation,
        'discussion_link': question.discussion_link,
        'favorite': question.favorite
    } for question in favorites]
    return jsonify(favorites_list)

@app.route('/api/toggleFavorite', methods=['POST'])
def toggle_favorite():
    data = request.json
    question_id = data['question_id']
    question = db.session.query(Question).get(question_id)
    if question:
        question.favorite = not question.favorite
        db.session.commit()
    return jsonify({"message": "Favorite toggled"}), 200

@app.route('/api/updateUserSelection', methods=['POST'])
def update_user_selection():
    data = request.json
    question_id = data['question_id']
    selected_option = data['selected_option']  # Can be None for deselection
    question = db.session.query(Question).get(question_id)
    if question:
        question.user_selected_option = selected_option
        db.session.commit()
        return jsonify({"message": "User selection updated"}), 200
    return jsonify({"message": "Question not found"}), 404

@app.route('/api/getUserSelections/<string:quiz_set_id>', methods=['GET'])
def get_user_selections(quiz_set_id):
    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).all()
    selections = {question.id: question.user_selected_option for question in questions}
    return jsonify(selections)

@app.route('/api/updateScore', methods=['POST'])
def update_score():
    data = request.json
    question_id = data['question_id']
    increment = data['increment']  # True to increment, False to decrement
    quiz_set_id = data['quiz_set_id']

    # Initialize score if not exists
    if 'scores' not in session:
        session['scores'] = {}

    # Initialize quiz set score if not exists
    if quiz_set_id not in session['scores']:
        session['scores'][quiz_set_id] = 0

    # Update score
    if increment:
        session['scores'][quiz_set_id] += 1
    else:
        session['scores'][quiz_set_id] = max(0, session['scores'][quiz_set_id] - 1)

    print(f"Updated score for quiz set {quiz_set_id}: {session['scores'][quiz_set_id]}")
    return jsonify({"message": "Score updated", "current_score": session['scores'][quiz_set_id]}), 200

@app.route('/api/getScore/<string:quiz_set_id>', methods=['GET'])
def get_score(quiz_set_id):
    # Initialize score if not exists
    if 'scores' not in session or quiz_set_id not in session['scores']:
        return jsonify({"message": "Score not available", "score": 0}), 404

    return jsonify({"score": session['scores'][quiz_set_id]}), 200

@app.route('/api/shuffleQuestions/<string:quiz_set_id>', methods=['POST'])
def shuffle_questions(quiz_set_id):
    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).all()
    if not questions:
        return jsonify({'message': 'No questions found for this quiz set'}), 404
    
    question_ids = [q.id for q in questions]
    random.shuffle(question_ids)

    for new_order, question_id in enumerate(question_ids):
        question = next(q for q in questions if q.id == question_id)
        question.order = new_order
        question.user_selected_option = None  # Reset user selection
    
    db.session.commit()

    shuffled_questions = Question.query.filter_by(quiz_set_id=quiz_set_id).order_by(Question.order).all()
    return jsonify([{
        'id': question.id,
        'order': question.order,  # Include the order field
        'text': question.text,
        'options': question.options,
        'answer': question.answer,
        'quiz_set_id': question.quiz_set_id,
        'favorite': question.favorite,
        'url': question.url,
        'explanation': question.explanation,
        'discussion_link': question.discussion_link,
        'user_selected_option': question.user_selected_option
    } for question in shuffled_questions]), 200

@app.route('/api/resetQuestions/<string:quiz_set_id>', methods=['POST'])
def reset_questions(quiz_set_id):
    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).order_by(Question.order).all()
    if not questions:
        return jsonify({'message': 'No questions found for this quiz set'}), 404
    
    for question in questions:
        question.user_selected_option = None  # Reset user selection
    
    db.session.commit()

    # Return the questions in their original order with necessary fields
    return jsonify([{
        'id': question.id,
        'order': question.order,
        'text': question.text,
        'options': question.options,
        'answer': question.answer,
        'quiz_set_id': question.quiz_set_id,
        'favorite': question.favorite,
        'url': question.url,
        'explanation': question.explanation,
        'discussion_link': question.discussion_link,
        'user_selected_option': question.user_selected_option
    } for question in questions]), 200

@app.route('/api/getQuizSetDetails/<string:quiz_set_id>', methods=['GET'])
def get_quiz_set_details(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if not quiz_set:
        return jsonify({'message': 'Quiz set not found'}), 404

    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).all()
    answered_questions = [q for q in questions if q.user_selected_option is not None]
    progress = len(answered_questions) / len(questions) * 100 if questions else 0

    return jsonify({
        'id': quiz_set.id,
        'title': quiz_set.title,
        'urls': json.loads(quiz_set.urls) if quiz_set.urls else [],
        'progress': round(progress),
        'total_questions': len(questions),
        'answered_questions': len(answered_questions),
        'score': quiz_set.score,
        'attempts': quiz_set.attempts
    })

@app.route('/api/getQuizSetScore/<string:quiz_set_id>', methods=['GET'])
def get_quiz_set_score(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if not quiz_set:
        return jsonify({'message': 'Quiz set not found'}), 404

    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).all()
    correct_answers_count = sum(1 for q in questions if q.user_selected_option == q.answer)

    score = correct_answers_count  # or calculate the percentage if needed
    total_questions = len(questions)

    return jsonify({"score": score, "total_questions": total_questions}), 200

@app.route('/api/updateQuizSetScore/<string:quiz_set_id>', methods=['POST'])
def update_quiz_set_score(quiz_set_id):
    data = request.json
    score = data['score']

    quiz_set = QuizSet.query.get(quiz_set_id)
    if not quiz_set:
        return jsonify({'message': 'Quiz set not found'}), 404

    # Create a new Attempt
    new_attempt = Attempt(quiz_set_id=quiz_set_id, score=score)
    db.session.add(new_attempt)

    # Update attempts count
    quiz_set.attempts += 1

    # Mark the quiz as finished
    quiz_set.finished = True

    db.session.commit()

    print(f"New attempt recorded for quiz_set_id {quiz_set_id}. Total attempts: {quiz_set.attempts}")

    return jsonify({"message": "Score updated successfully"}), 200

@app.route('/api/saveEditorContent', methods=['POST'])
def save_editor_content():
    try:
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({'message': 'No content provided'}), 400

        # Create a new EditorContent object or update an existing one
        editor_content = EditorContent.query.first()
        if editor_content:
            editor_content.content = content
        else:
            editor_content = EditorContent(content=content)
            db.session.add(editor_content)

        db.session.commit()
        return jsonify({'message': 'Content saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error saving editor content: {str(e)}")
        return jsonify({'message': 'An error occurred while saving content'}), 500

@app.route('/api/getEditorContent', methods=['GET'])
def get_editor_content():
    # For simplicity, retrieving the latest content
    content = EditorContent.query.order_by(EditorContent.id.desc()).first()
    
    if content:
        return jsonify({"content": content.content}), 200
    else:
        return jsonify({"message": "No content found"}), 404

@app.route('/api/getEyeIconState/<string:quiz_set_id>', methods=['GET'])
def get_eye_icon_state(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        return jsonify({"state": quiz_set.eye_icon_state}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/updateEyeIconState/<string:quiz_set_id>', methods=['POST'])
def update_eye_icon_state(quiz_set_id):
    data = request.json
    state = data['state']  # True for 'open', False for 'none'
    
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        quiz_set.eye_icon_state = state
        db.session.commit()
        return jsonify({"message": "Eye icon state updated"}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/updateQuizSetStatus/<string:quiz_set_id>', methods=['POST'])
def update_quiz_set_status(quiz_set_id):
    data = request.json
    status = data.get('status')

    quiz_set = QuizSet.query.get(quiz_set_id)
    if not quiz_set:
        return jsonify({'message': 'Quiz set not found'}), 404

    quiz_set.status = status
    db.session.commit()

    return jsonify({'message': 'Quiz set status updated successfully'}), 200

def get_llm_response(prompt, providers):
    for provider in providers:
        try:
            llm: LLM = G4FLLM(
                model=models.gpt_35_turbo,
                provider=provider,
            )
            res = llm(prompt)
            return res
        except Exception as e:
            print(f"Error with provider {provider}: {e}")
            continue
    raise Exception("All providers failed")

# Route to get further explanation based on POST request
@app.route('/api/getFurtherExplanation', methods=['POST'])
def post_further_explanation():
    data = request.json
    print("Received data:", data)
    question_text = data['question_text']
    options = data['options']
    answer = data['answer']
    explanation = data.get('explanation', '')

    # Construct the prompt for the AI bot
    if explanation and explanation != "Explanation not found.":
        prompt = f"Given this explanation '{explanation}', explain further why {answer} is the answer to this following Question: {question_text} {' '.join(options)}. Explain it in the simplest and most appropriate way to understand, in Layman’s terms, why {answer} is the answer. Also, identify very brief keywords from the question_text that would serve as a memory guide or hint that would immediately kick in as to why we have the respective answer."
    else:
        prompt = f"Given this Question: {question_text} {' '.join(options)}, explain in the simplest and most appropriate way to understand, in Layman’s terms, why {answer} is the answer. Also, identify very brief keywords from the question_text that would serve as a memory guide or hint that would immediately kick in as to why we have the respective answer."

    try:
        further_explanation = get_llm_response(prompt, providers_to_try)
        return jsonify({"further_explanation": further_explanation})
    except Exception as e:
        print(f"Error obtaining further explanation: {e}")
        return jsonify({"error": "Failed to get further explanation"}), 500

# Route to save further explanation
@app.route('/api/saveFurtherExplanation', methods=['POST'])
def save_further_explanation():
    data = request.json
    question_id = data['question_id']
    explanation = data['explanation']

    # Create and save further explanation
    new_explanation = FurtherExplanation(question_id=question_id, explanation=explanation)
    db.session.add(new_explanation)
    db.session.commit()

    return jsonify({"message": "Further explanation saved"}), 200

# New GET route to retrieve further explanation
@app.route('/api/getFurtherExplanation/<int:question_id>', methods=['GET'])
def get_further_explanation(question_id):
    explanation = FurtherExplanation.query.filter_by(question_id=question_id).first()
    if explanation:
        return jsonify({"explanation": explanation.explanation}), 200
    else:
        return jsonify({"message": "Further explanation not found"}), 404

@app.route('/api/toggleLockState/<string:quiz_set_id>', methods=['POST'])
def toggle_lock_state(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        quiz_set.lock_state = not quiz_set.lock_state
        db.session.commit()
        return jsonify({"message": "Lock state toggled"}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/getLockState/<string:quiz_set_id>', methods=['GET'])
def get_lock_state(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        return jsonify({"lock_state": quiz_set.lock_state}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

# Assuming you have a way to store the global lock state, like a variable or database entry
global_lock_state = True  # Default state

@app.route('/api/toggleLockState/global', methods=['POST'])
def toggle_global_lock_state():
    global global_lock_state
    global_lock_state = not global_lock_state
    return jsonify({"message": "Global lock state toggled", "new_state": global_lock_state}), 200

@app.route('/api/getLockState/global', methods=['GET'])
def get_global_lock_state():
    global global_lock_state
    return jsonify({"lock_state": global_lock_state}), 200

@app.route('/api/getDiscussionComments/<int:question_id>', methods=['GET'])
def get_discussion_comments(question_id):
    question = Question.query.get(question_id)
    if question and question.discussion_link:
        try:
            comments = fetch_discussion_comments(question.discussion_link)
            return jsonify({"discussion_comments": comments}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Question or discussion link not found"}), 404

@app.route('/api/downloadQuizPdf/<string:quiz_set_id>', methods=['GET'])
def download_quiz_pdf(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if not quiz_set:
        return jsonify({'message': 'Quiz set not found'}), 404

    questions = Question.query.filter_by(quiz_set_id=quiz_set_id).order_by(Question.order).all()
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y_position = height - 30
    p.drawString(30, y_position, f"Quiz: {quiz_set.title}")
    y_position -= 20

    for i, question in enumerate(questions, start=1):
        y_position -= 15
        p.drawString(30, y_position, f"Question No. {i}: {strip_tags(question.text)}")
        y_position -= 15

        for j, option in enumerate(question.options, start=1):
            p.drawString(30, y_position, f"{chr(64+j)}. {strip_tags(option)}")  # Adjusted x-coordinate to 30
            y_position -= 15

        correct_answer = question.answer.replace("Option ", "")
        p.drawString(30, y_position, f"Answer: {correct_answer}")  # Adjusted x-coordinate to 30
        y_position -= 20

        if y_position < 50:
            p.showPage()
            y_position = height - 30

    p.save()
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name=f"{quiz_set.title}.pdf", mimetype='application/pdf')\

@app.route('/api/deleteQuizSet/<string:quiz_set_id>', methods=['DELETE'])
def delete_quiz_set(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if not quiz_set:
        return jsonify({'message': 'Quiz set not found'}), 404

    db.session.delete(quiz_set)
    db.session.commit()
    
    return jsonify({'message': f'Quiz set {quiz_set_id} deleted successfully'}), 200

@app.route('/api/deleteMultipleQuizSets', methods=['POST'])
def delete_multiple_quiz_sets():
    data = request.json
    quiz_set_ids = data.get('quizSetIds', [])
    
    if not quiz_set_ids:
        return jsonify({'message': 'No quiz sets specified for deletion'}), 400
    
    try:
        quiz_sets = QuizSet.query.filter(QuizSet.id.in_(quiz_set_ids)).all()
        for quiz_set in quiz_sets:
            db.session.delete(quiz_set)
        db.session.commit()
        return jsonify({'message': f'{len(quiz_set_ids)} quiz sets deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting quiz sets: {str(e)}'}), 500

@app.route('/api/deleteAllQuizSets', methods=['POST'])
def delete_all_quiz_sets():
    try:
        quiz_sets = QuizSet.query.all()
        for quiz_set in quiz_sets:
            db.session.delete(quiz_set)
        db.session.commit()
        return jsonify({'message': 'All quiz sets deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting all quiz sets: {str(e)}'}), 500

@app.route('/api/getRawUrls/<string:quiz_set_id>', methods=['GET'])
def get_raw_urls(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        return jsonify({"rawUrls": quiz_set.raw_urls}), 200
    return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/updateSortOrder', methods=['POST'])
def update_sort_order():
    data = request.json
    sort_order = data.get('sortOrder')
    if sort_order not in ['asc', 'desc']:
        return jsonify({"message": "Invalid sort order"}), 400

    # Update sort order for all quiz sets
    QuizSet.query.update({QuizSet.sort_order: sort_order})
    db.session.commit()

    return jsonify({"message": "Sort order updated successfully"}), 200

@app.route('/api/getSortOrder', methods=['GET'])
def get_sort_order():
    # Get the sort order from any quiz set (assuming all have the same sort order)
    quiz_set = QuizSet.query.first()
    if quiz_set:
        return jsonify({"sortOrder": quiz_set.sort_order}), 200
    else:
        return jsonify({"sortOrder": "desc"}), 200  # Default to 'desc' if no quiz sets exist

@app.route('/api/updateCurrentQuestionIndex/<string:quiz_set_id>', methods=['POST'])
def update_current_question_index(quiz_set_id):
    data = request.json
    index = data.get('index')
    
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        quiz_set.current_question_index = index
        db.session.commit()
        return jsonify({"message": "Current question index updated successfully"}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/getCurrentQuestionIndex/<string:quiz_set_id>', methods=['GET'])
def get_current_question_index(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        return jsonify({"current_question_index": quiz_set.current_question_index}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/updateQuizSetState/<string:quiz_set_id>', methods=['POST'])
def update_quiz_set_state(quiz_set_id):
    data = request.json
    index = data.get('index')
    filter_type = data.get('filter')
    
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        quiz_set.current_question_index = index
        quiz_set.current_filter = filter_type
        db.session.commit()
        return jsonify({"message": "Quiz set state updated successfully"}), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/getQuizSetState/<string:quiz_set_id>', methods=['GET'])
def get_quiz_set_state(quiz_set_id):
    quiz_set = QuizSet.query.get(quiz_set_id)
    if quiz_set:
        return jsonify({
            "current_question_index": quiz_set.current_question_index,
            "current_filter": quiz_set.current_filter
        }), 200
    else:
        return jsonify({"message": "Quiz set not found"}), 404

@app.route('/api/auth/github')
def github_login():
    print("[DEBUG] GitHub login route accessed")
    redirect_uri = url_for('github_authorized', _external=True)
    print(f"[DEBUG] Redirect URI: {redirect_uri}")
    return github.authorize_redirect(redirect_uri=redirect_uri)

@app.route('/api/auth/github/callback')
def github_authorized():
    try:
        token = github.authorize_access_token()
        resp = github.get('user', token=token)
        user_info = resp.json()
        
        user = User.query.filter_by(github_id=str(user_info['id'])).first()
        if not user:
            user = User(
                github_id=str(user_info['id']),
                name=user_info['login'],
                email=user_info.get('email'),
                avatar_url=user_info['avatar_url']
            )
            db.session.add(user)
        else:
            user.avatar_url = user_info['avatar_url']  # Update avatar URL on each login
        db.session.commit()
        
        session['user_id'] = user.id
        session['user_name'] = user.name
        session['user_avatar'] = user.avatar_url
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/Dashboard")
    except Exception as e:
        print(f"Error in github_authorized: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return jsonify({"error": "Missing required fields"}), 400

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"error": "Invalid email format"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 400

        new_user = User(name=name, email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in signup: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/auth/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        session['user_name'] = user.name
        return jsonify({
            "message": "Logged in successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/auth/status')
def auth_status():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'isLoggedIn': True,
                'username': user.name,
                'avatar': user.avatar_url
            })
    return jsonify({'isLoggedIn': False})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    print(f"[DEBUG] Logout requested for user: {session.get('user_name')}")
    session.clear()  # Clear all session data
    return jsonify({'message': 'Successfully logged out'})