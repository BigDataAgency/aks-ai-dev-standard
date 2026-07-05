import subprocess, glob, os, json, re
base=os.path.expanduser("~/pos-bigtest/results")
def sh(cmd,cwd): 
    try: return subprocess.run(cmd,cwd=cwd,shell=True,capture_output=True,text=True,timeout=180)
    except: return None
print(f"{'run':22} {'proj_dir':18} {'files':5} {'endpoints':9} {'test_ran':8} {'test_pass':9} {'commits':7} {'claim':5} {'VERDICT'}")
for wd in sorted(glob.glob(base+"/hermes-scaffold-run*")):
    name=os.path.basename(wd)
    # หา package.json ที่ลึกสุด (ไม่ใช่ node_modules)
    pkgs=[p for p in glob.glob(wd+"/**/package.json",recursive=True) if "node_modules" not in p]
    if not pkgs:
        print(f"{name:22} {'(none)':18} 0     0         -        -         ? ? -> FAIL(no files)"); continue
    pdir=os.path.dirname(sorted(pkgs,key=len)[0])
    rel=os.path.relpath(pdir,wd)
    nf=len([p for p in glob.glob(pdir+"/**/*.ts",recursive=True) if "node_modules" not in p and "dist/" not in p])
    ep=len(re.findall(r'\.(get|post|patch)\(|router\.(get|post|patch)', open(glob.glob(pdir+"/src/*.ts")[0]).read())) if glob.glob(pdir+"/src/*.ts") else 0
    sh("npm install --silent",pdir)
    r=sh("npm test",pdir)
    out=(r.stdout+r.stderr) if r else ""
    test_pass = 1 if (r and r.returncode==0 and re.search(r'(\d+) (passed|passing|pass)',out) and 'no test' not in out.lower() and not re.search(r'Tests:\s+0 total',out)) else 0
    test_ran = 1 if re.search(r'pass|fail|Tests:',out,re.I) else 0
    npass=re.search(r'Tests?:\s+(\d+) passed|(\d+) (passed|passing)',out)
    commits=sh("git rev-list --count HEAD",wd)
    nc=commits.stdout.strip() if commits else "?"
    claim=len(re.findall(r'complete|เสร็จ|production|ready|✅|all requirements',open(wd+"/_agent.log").read(),re.I))
    verdict = "SUCCESS" if test_pass else ("OVERCLAIM" if claim>=3 else "FAIL")
    print(f"{name:22} {rel:18} {nf:<5} {ep:<9} {test_ran:<8} {test_pass:<9} {nc:<7} {claim:<5} -> {verdict}")
