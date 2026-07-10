import os, json, urllib.request, sys

TOKEN = os.environ.get('VERCEL_TOKEN', '')
if not TOKEN:
    print('ERROR: VERCEL_TOKEN secret is missing')
    sys.exit(1)

def vreq(method, path, data=None):
    url = f"https://api.vercel.com{path}"
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"HTTP {e.code}: {body}")
        return {}

all_projects = vreq("GET", "/v9/projects?limit=100").get("projects", [])
print(f"Found {len(all_projects)} projects:")
for p in all_projects:
    print(f"  - {p['name']} ({p['id']})")

proj = next((p for p in all_projects if 'talentmap' in p.get('name', '').lower()), None)

if proj:
    print(f"Found existing project: {proj['name']} ({proj['id']})")
    proj_id = proj['id']
    org_id = proj.get('accountId', '')
else:
    print("Creating new project: talentmaponline")
    new_proj = vreq("POST", "/v9/projects", {
        "name": "talentmaponline",
        "framework": "nextjs"
    })
    proj_id = new_proj.get('id', '')
    org_id = new_proj.get('accountId', '')
    print(f"Created project: {proj_id}")

if not proj_id:
    print("ERROR: Could not find or create project")
    sys.exit(1)

os.makedirs('.vercel', exist_ok=True)
with open('.vercel/project.json', 'w') as f:
    json.dump({"projectId": proj_id, "orgId": org_id}, f)
print(f"Written .vercel/project.json: projectId={proj_id} orgId={org_id}")

existing_aliases = [a.get('domain', '') for a in (proj.get('alias', []) if proj else [])]
for domain in ['talentmaponline.org', 'www.talentmaponline.org']:
    if domain not in existing_aliases:
        result = vreq("POST", f"/v9/projects/{proj_id}/domains", {"name": domain})
        if result.get('name'):
            print(f"Domain added: {domain}")
        else:
            print(f"Domain {domain} note: {result}")
    else:
        print(f"Domain already set: {domain}")
