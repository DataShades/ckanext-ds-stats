import datetime as datetime


def get_helpers():
    return {
        'date_range': date_range
    }


def date_range():
    return list(reversed(range(2013, datetime.datetime.now().year+1)))
