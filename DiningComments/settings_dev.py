DEBUG = True
TEMPLATE_DEBUG = DEBUG

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dining_comments_db',
        'USER': 'django',
        'PASSWORD': 'django',
        'HOST': 'localhost',
        'PORT': '',
    }
}
