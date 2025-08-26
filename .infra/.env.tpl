{% for key, value in env_variables.items() %}
{% if value is string and ' ' in value %}
{{ key }}='{{ value }}'
{% else %}
{{ key }}={{ value }}
{% endif %}
{% endfor %}