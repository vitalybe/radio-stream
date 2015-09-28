import logging
from os import path

LOG_FILE = path.join(path.dirname(__file__), "output.log")
LOG_LEVEL = logging.INFO

logging.root.setLevel(LOG_LEVEL)
fh = logging.FileHandler(LOG_FILE)
fh.setLevel(LOG_LEVEL)
ch = logging.StreamHandler()
ch.setLevel(LOG_LEVEL)
# create formatter and add it to the handlers
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
ch.setFormatter(formatter)
fh.setFormatter(formatter)
# add the handlers to logging.root
logging.root.addHandler(ch)
logging.root.addHandler(fh)
