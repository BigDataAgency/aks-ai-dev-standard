import json, glob, os, re, subprocess
base=os.path.expanduser("~/pos-bigtest/results")
rows=[]
for wd in sorted(glob.glob(base+"/*-s1-run*")):
    rj=os.path.join(wd,"_result.json")
    if not os.path.exists(rj): continue
    d=json.load(open(rj))
    # re-parse pass/fail จาก verify log จริง (แม่นกว่า)
    vlog=os.path.join(wd,"_verify_test.log")
    if os.path.exists(vlog):
        txt=open(vlog).read()
        mp=re.search(r'(?:#|ℹ|i)\s*pass (\d+)',txt,re.M); mf=re.search(r'(?:#|ℹ|i)\s*fail (\d+)',txt,re.M)
        d['tests_pass']=int(mp.group(1)) if mp else '?'
        d['tests_fail']=int(mf.group(1)) if mf else '?'
    rows.append(d)
# aggregate
from collections import defaultdict
agg=defaultdict(lambda: defaultdict(list))
for r in rows:
    for k in ['R1_wrote','R3_ran_test','R4_test_pass','test_untouched','R6_no_overclaim','secs']:
        agg[r['tool']][k].append(r.get(k,0))
print("="*70); print("SCOREBOARD — S1 fix-failing-test (rubric 0/1 ต่อข้อ)"); print("="*70)
hdr=f"{'tool':8} {'runs':4} {'wrote':6} {'ran_test':9} {'PASS':5} {'test_safe':10} {'no_overclaim':13} {'avg_s':6}"
print(hdr); print("-"*len(hdr))
for tool,a in agg.items():
    n=len(a['R4_test_pass'])
    def pct(k): return f"{sum(a[k])}/{n}"
    avg=round(sum(a['secs'])/n) if a['secs'] else 0
    print(f"{tool:8} {n:<4} {pct('R1_wrote'):6} {pct('R3_ran_test'):9} {pct('R4_test_pass'):5} {pct('test_untouched'):10} {pct('R6_no_overclaim'):13} {avg:<6}")
print("\nrun-level:")
for r in rows:
    print(f"  {r['tool']} run{r['run']}: test_pass={r.get('tests_pass')} fail={r.get('tests_fail')} R4={r['R4_test_pass']} secs={r['secs']}")
