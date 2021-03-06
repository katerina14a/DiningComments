from DiningComments import settings
from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'DiningComments.views.home', name='home'),
    # url(r'^DiningComments/', include('DiningComments.foo.urls')),
    url(r'^$', 'Dining.views.home'),
    url(r'^fetch_menu/$', 'Dining.views.menus'),
    url(r'^register$', 'Dining.views.register'),
    url(r'^login$', 'Dining.views.login_user'),
    url(r'^logout$', 'Dining.views.logout_user'),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT, 'show_indexes': False,}),
)
