env:
  ui:
    ENV: "{{ env_name }}"
    ACCOMPAGNATEUR_ENV: "{{ env_name }}"
    EXPOSITION_API_BASE_URL: https://api.exposition.inserjeunes.beta.gouv.fr
    NEXT_PUBLIC_DOMAIN: {{ dns_name }}
    NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL: /api
    NEXT_PUBLIC_EXPOSITION_API_BASE_URL: https://api.exposition.inserjeunes.beta.gouv.fr
    NEXT_PUBLIC_LOGROCKET: {{ NEXT_PUBLIC_LOGROCKET }}
    NEXT_PUBLIC_MATOMO_SITE_ID: {{ NEXT_PUBLIC_MATOMO_SITE_ID }}
    NEXT_PUBLIC_MATOMO_URL: https://stats.beta.gouv.fr
    NEXT_PUBLIC_MATOMO_ENABLE: {{ NEXT_PUBLIC_MATOMO_ENABLE }}
  server:
    ## Environment
    ENV: "{{ env_name }}"
    ACCOMPAGNATEUR_ENV: "{{ env_name }}"
    ACCOMPAGNATEUR_LOG_LEVEL: info
    ACCOMPAGNATEUR_LOG_DESTINATIONS: stdout,sql
    VOLUME_DIR: /data

    ## PSQL
    ACCOMPAGNATEUR_POSTGRES_URI: "{{ vault[env_name].ACCOMPAGNATEUR_POSTGRES_URI }}"
    ACCOMPAGNATEUR_POSTGRES_CA: "{{ vault[env_name].ACCOMPAGNATEUR_POSTGRES_CA }}"
    DATABASE_URL: "{{ vault[env_name].ACCOMPAGNATEUR_POSTGRES_URI }}"

    ## Product 
    EXPOSITION_API_USERNAME: "{{ vault[env_name].EXPOSITION_API_USERNAME }}"
    EXPOSITION_API_PASSWORD: "{{ vault[env_name].EXPOSITION_API_PASSWORD}}"
    RCO_BUCKET_ENDPOINT: "{{ vault[env_name].RCO_BUCKET_ENDPOINT }}"
    RCO_BUCKET_REGION: "{{ vault[env_name].RCO_BUCKET_REGION }}"
    RCO_BUCKET_ACCESS_KEY: "{{ vault[env_name].RCO_BUCKET_ACCESS_KEY }}"
    RCO_BUCKET_SECRET_KEY: "{{ vault[env_name].RCO_BUCKET_SECRET_KEY }}"
    RCO_BUCKET_NAME: "{{ vault[env_name].RCO_BUCKET_NAME }}"
    TYPESENSE_API_KEY: "{{ vault[env_name].TYPESENSE_API_KEY }}"
    TYPESENSE_HOST: "cqlp-typesense"
    FRANCE_TRAVAIL_API_CLIENT_ID: "{{ vault[env_name].FRANCE_TRAVAIL_API_CLIENT_ID }}"
    FRANCE_TRAVAIL_API_CLIENT_SECRET: "{{ vault[env_name].FRANCE_TRAVAIL_API_CLIENT_SECRET }}"
    CATALOGUE_APPRENTISSAGE_USERNAME: "{{ vault[env_name].CATALOGUE_APPRENTISSAGE_USERNAME }}"
    CATALOGUE_APPRENTISSAGE_PASSWORD: "{{ vault[env_name].CATALOGUE_APPRENTISSAGE_PASSWORD }}"
  typesense:
    TYPESENSE_API_KEY: "{{ vault[env_name].TYPESENSE_API_KEY }}"
  metabase:
    # Nothing