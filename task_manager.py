
import sys
import json
import time
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import os

def get_tasks_file_path():
    if sys.platform == 'win32':
        return os.path.join(os.environ['APPDATA'], 'app-electron', 'tasks.json')
    elif sys.platform == 'darwin':
        return os.path.join(os.path.expanduser('~'), 'Library', 'Application Support', 'app-electron', 'tasks.json')
    else:
        return os.path.join(os.path.expanduser('~'), '.config', 'app-electron', 'tasks.json')

def schedule_task(scheduler, task):
    scheduled_time = datetime.fromisoformat(task['scheduled_at'])
    if scheduled_time > datetime.now():
        print(f"Scheduling task: {task['title']} at {scheduled_time}", file=sys.stderr)
        scheduler.add_job(lambda: print(task['id'], flush=True), 'date', run_date=scheduled_time)

def main():
    scheduler = BackgroundScheduler()
    scheduler.start()

    tasks_file_path = get_tasks_file_path()

    while True:
        try:
            with open(tasks_file_path, 'r') as f:
                tasks = json.load(f)
            
            scheduler.remove_all_jobs()

            for task in tasks:
                if task.get('scheduled_at') and task.get('status') == 'pending':
                    schedule_task(scheduler, task)
        except (FileNotFoundError, json.JSONDecodeError):
            pass # No tasks file yet or it's empty

        for line in sys.stdin:
            try:
                tasks = json.loads(line)
                scheduler.remove_all_jobs()
                for task in tasks:
                    if task.get('scheduled_at') and task.get('status') == 'pending':
                        schedule_task(scheduler, task)
            except json.JSONDecodeError:
                pass

        time.sleep(5)


if __name__ == "__main__":
    main()
