issuer: https://${dex_domain}

storage:
  type: kubernetes
  config:
    inCluster: true

web:
  http: 0.0.0.0:5556

# Configure GitHub connector for username-based auth
connectors:
- type: github
  id: github
  name: GitHub
  config:
    clientID: $GITHUB_CLIENT_ID
    clientSecret: $GITHUB_CLIENT_SECRET
    redirectURI: https://${dex_domain}/callback
    
    # Organization configuration
    orgs:
    - name: ${github_org}

    # Use GitHub username as the user ID
    useLoginAsID: true
    userIDKey: login
    userNameKey: login
    
    # Load all team memberships (optional, for team-based auth)
    loadAllGroups: false
    
    # Team name format (slug or name)
    teamNameField: slug

# Static clients for kubectl and other tools
staticClients:
- id: kubectl
  redirectURIs:
  - http://localhost:8000
  - http://localhost:18000  # Alternative port
  name: 'Kubectl OIDC Login'
  secret: kubectl-secret

- id: gangway
  redirectURIs:
  - https://auth.${dex_domain}/callback
  name: 'Gangway Web UI'
  secret: gangway-secret

# Optional: Enable gRPC API
grpc:
  addr: 0.0.0.0:5557

# Logging configuration
logger:
  level: info
  format: json

# OAuth2 configuration
oauth2:
  skipApprovalScreen: true
  alwaysShowLoginScreen: false

# Frontend configuration
frontend:
  theme: dark
  issuer: Kubernetes Cluster
  logoURL: https://github.com/dexidp/dex/blob/master/web/static/img/dex-horizontal-color.png?raw=true