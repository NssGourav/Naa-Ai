import json
import os
import hashlib

class Storage:
    def __init__(self, storage_dir="data"):
        self.storage_dir = storage_dir
        if not os.path.exists(self.storage_dir):
            os.makedirs(self.storage_dir)

    def _get_hash(self, text):
        return hashlib.md5(text.encode()).hexdigest()

    def save_lecture(self, lecture_data):
        lecture_id = self._get_hash(lecture_data["all_text"])
        lecture_data["id"] = lecture_id
        file_path = os.path.join(self.storage_dir, f"{lecture_id}.json")
        
        with open(file_path, "w") as f:
            json.dump(lecture_data, f)
        
        return lecture_id

    def get_lecture(self, lecture_id):
        file_path = os.path.join(self.storage_dir, f"{lecture_id}.json")
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, "r") as f:
            return json.load(f)

    def list_lectures(self):
        lectures = []
        for filename in os.listdir(self.storage_dir):
            if filename.endswith(".json"):
                with open(os.path.join(self.storage_dir, filename), "r") as f:
                    data = json.load(f)
                    lectures.append({"id": data["id"], "title": data["title"]})
        return lectures
