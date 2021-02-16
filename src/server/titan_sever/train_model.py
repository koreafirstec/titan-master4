import requests
import json
import time

class Model:
    def __init__(self):
        self.is_running = True
        self.schedule = False
        self.fk_model_idx = ''
        self.epochs = ''

    def check_model_schedule(self):
        servers_url = "http://localhost:8080/api/model_schedule"
        result = requests.get(servers_url, verify=False).text
        data = json.loads(result)
        if data['status'] == 200:
            self.schedule = True
            objects = data['objects'][0]
            self.fk_model_idx = objects['fk_model_idx']
            self.epochs = objects['epochs']
        else:
            self.schedule = False

    def train_model(self):
        servers_url = "http://localhost:8080/api/titan_model?model_idx=" + str(self.fk_model_idx) + '&epochs=' + str(self.epochs)
        result = requests.get(servers_url, verify=False).text

    def run(self):
        while self.is_running:
            try:
                self.check_model_schedule()
                if self.schedule:
                    self.train_model()
                else:
                    time.sleep(10)
            except KeyboardInterrupt:
                print('End train_model')
                self.is_running = False

    # def stop_process(self):
    #     self.is_running = False


if __name__ == '__main__':
    app = Model()
    app.run()
