from django.shortcuts import render
from django.http import HttpResponse

def api_docs_view(request):
    """View to render API documentation"""
    return render(request, 'base.html')

def section_view(request, section_name):
    """View to serve section HTML files"""
    section_file = f'sections/{section_name}.html'
    try:
        return render(request, section_file)
    except:
        return HttpResponse('Section not found', status=404)

