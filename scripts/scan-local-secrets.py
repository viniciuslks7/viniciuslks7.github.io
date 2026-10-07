"""Conservative local staged-text scan; this is not a GitGuardian result."""
from pathlib import Path
import subprocess,re,json,datetime
patterns={
 'private-key':r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----',
 'aws-access-id':r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
 'github-token':r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b',
 'google-api-key':r'\bAIza[0-9A-Za-z_-]{30,}\b',
 'slack-token':r'\bxox[baprs]-[A-Za-z0-9-]{20,}\b',
 'stripe-live-key':r'\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b',
 'credential-url':r'https?://[^\s/<>"\']+:[^\s/<>"\']+@',
}
names=subprocess.check_output(['git','diff','--cached','--name-only','--diff-filter=ACM'],text=True).splitlines()
findings=[];scanned=[];binary=[]
for name in names:
    data=subprocess.check_output(['git','show',':'+name])
    if b'\0' in data:binary.append(name);continue
    text=data.decode('utf-8',errors='replace');scanned.append(name)
    for label,pattern in patterns.items():
        for match in re.finditer(pattern,text):
            findings.append({'file':name,'line':text[:match.start()].count('\n')+1,'detector':label})
report={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'failed' if findings else 'passed','scannedStagedTextFiles':len(scanned),'binaryFilesNotTextScanned':binary,'findings':findings,'limitation':'Pattern scan only. Not GitGuardian; no API credential available locally. Does not certify binary assets or historical commits.'}
Path('verification').mkdir(exist_ok=True)
Path('verification/local-secret-scan.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
raise SystemExit(1 if findings else 0)
