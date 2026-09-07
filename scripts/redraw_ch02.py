"""Reproduce Lecture 2 teaching diagrams as vectors; source PDF is untouched.
Run: MPLCONFIGDIR=/tmp/ie437-mpl python3 scripts/redraw_ch02.py
Requires numpy, scipy, matplotlib. No extra dependency in the site build.
"""
from pathlib import Path
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.stats import beta

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/ch02'
BLUE, AMBER, GREEN, INK = '#2563eb', '#d97706', '#16a34a', '#16181d'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.titlesize': 12,
 'axes.labelsize': 10, 'xtick.labelsize': 9, 'ytick.labelsize': 9,
 'axes.spines.top': False, 'axes.spines.right': False, 'axes.edgecolor': '#acafb4',
 'axes.labelcolor': INK, 'text.color': INK, 'svg.fonttype': 'path', 'svg.hashsalt': 'ie437-ch02'})

def save(fig, name):
    fig.savefig(OUT / (name+'.svg'), bbox_inches='tight', facecolor='white', metadata={'Date': None})
    target = OUT / (name+'.svg')
    target.write_text('\n'.join(line.rstrip() for line in target.read_text().splitlines())+'\n')
    plt.close(fig)

def coin_panels(states, name):
    fig, axes = plt.subplots(len(states)//2, 2, figsize=(12, 5.1), layout='constrained')
    x=np.linspace(0,1,2001)
    for ax, (n,h) in zip(axes.flat, states):
        p=beta.pdf(x,1+h,1+n-h)
        ax.plot(x,p,color=BLUE,lw=2);ax.fill_between(x,0,p,color=BLUE,alpha=.10)
        ax.axvline(.5,color=INK,lw=1,ls='--',alpha=.45)
        ax.set(xlim=(0,1),ylim=(0,max(p)*1.16),xticks=[0,.5,1],ylabel='density')
        ax.set_title(f'{n} tosses, {h} heads  →  Beta({1+h}, {1+n-h})',loc='left',pad=6)
        ax.grid(axis='y',alpha=.14)
    for ax in axes[-1]: ax.set_xlabel('θ: probability of heads')
    save(fig,name)
coin_panels([(0,0),(1,1),(2,2),(3,2),(4,3),(5,3)],'coin-update-early')
coin_panels([(8,5),(15,9),(50,26),(500,259)],'coin-update-late')

# Match the live bayes-regression widget's mulberry32 stream and Box-Muller noise.
def rng(seed):
    t=seed
    while True:
        t=(t+0x6D2B79F5)&0xffffffff;r=t
        r=((r^(r>>15))*(r|1))&0xffffffff
        r^=(r+(((r^(r>>7))*(r|61))&0xffffffff))&0xffffffff
        yield ((r^(r>>14))&0xffffffff)/4294967296

def gaussian(r):
    return np.sqrt(-2*np.log(max(1e-9,next(r))))*np.cos(2*np.pi*next(r))
r=rng(9);xx=[];yy=[]
for i in range(100):
    x=-1+2*next(r);xx.append(x);yy.append(8+11*x+2.4*gaussian(r))
xx,yy=np.array(xx),np.array(yy)
fig,axes=plt.subplots(2,3,figsize=(12,5.0),layout='constrained')
records=[];ylim=[float(yy.min()),float(yy.max())];limits0=[0,16];limits1=[-8,24]
for j,n in enumerate([2,10,100]):
    X=np.column_stack([np.ones(n),xx[:n]]);y=yy[:n]
    cov=np.linalg.inv(X.T@X/2.4**2+np.eye(2)/6**2)
    mean=cov@X.T@y/2.4**2;ols=np.linalg.lstsq(X,y,rcond=None)[0]
    sr=rng(786);Z=np.array([[gaussian(sr),gaussian(sr)] for _ in range(60)])
    samples=mean+Z@np.linalg.cholesky(cov).T
    ax=axes[0,j]
    for w in samples:ax.plot([-1,1],[w[0]-w[1],w[0]+w[1]],color=GREEN,lw=.65,alpha=.17)
    ax.plot([-1,1],[ols[0]-ols[1],ols[0]+ols[1]],color=BLUE,lw=2,label='MLE')
    ax.plot([-1,1],[mean[0]-mean[1],mean[0]+mean[1]],color=GREEN,lw=2,label='MAP / mean')
    ax.scatter(xx[:n],y,s=12,color=INK,zorder=3)
    ax.set_title(f'{n} training cases',weight='bold');ax.set(xlabel='feature x',xticks=[-1,0,1],xlim=(-1,1))
    if j==0:ax.set_ylabel('response y');ax.legend(fontsize=8,loc='upper left')
    theta=np.linspace(0,2*np.pi,200)
    for k in [3,2,1]:
        pts=mean[:,None]+np.linalg.cholesky(cov)@np.array([np.cos(theta),np.sin(theta)])*k
        axes[1,j].fill(*pts,color=GREEN,alpha=.09);axes[1,j].plot(*pts,color=GREEN,lw=1)
    axes[1,j].scatter(*mean,color=GREEN,s=23,zorder=3)
    axes[1,j].scatter(*ols,color=BLUE,s=18,zorder=3)
    axes[1,j].scatter(8,11,marker='x',color=INK,s=35,zorder=3)
    axes[1,j].set(xlabel='intercept w₀')
    if j==0:axes[1,j].set_ylabel('slope w₁')
    ends=np.concatenate([samples[:,0]-samples[:,1],samples[:,0]+samples[:,1],ols[:1]-ols[1],ols[:1]+ols[1]])
    ylim.extend(ends);sd=np.sqrt(np.diag(cov))
    limits0.extend([mean[0]-3*sd[0],mean[0]+3*sd[0],ols[0]])
    limits1.extend([mean[1]-3*sd[1],mean[1]+3*sd[1],ols[1]])
    records.append({'n':n,'mean':mean.tolist(),'covariance':cov.tolist(),'ols':ols.tolist()})
for j in range(3):
    axes[0,j].set_ylim(min(ylim)-2,max(ylim)+2)
    axes[1,j].set(xlim=(min(limits0)-1,max(limits0)+1),ylim=(min(limits1)-1,max(limits1)+1))
    for ax in axes[:,j]:ax.grid(alpha=.12)
save(fig,'regression-posterior-grid')
(OUT/'redraw-data.json').write_text(json.dumps({'coin_states':[[0,0],[1,1],[2,2],[3,2],[4,3],[5,3],[8,5],[15,9],[50,26],[500,259]],
 'regression':{'seed':9,'truth':[8,11],'noise_sd':2.4,'prior_sd':6,'x':xx.tolist(),'y':yy.tolist(),'posteriors':records}},indent=2)+'\n')

# Original p.50's task -> formal model -> solve arrangement, redrawn with a house/data icon.
(OUT/'housing-model-flow.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="265" viewBox="0 0 1100 265" role="img" aria-label="House sales data become a linear model, then an estimation problem and a prediction">
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#92979f"/></marker></defs>
<rect width="1100" height="265" fill="white"/>
<g font-family="Inter, DejaVu Sans, sans-serif" fill="#16181d">
<g fill="#f4f5f6" stroke="#d5d8dc"><rect x="8" y="35" width="310" height="215" rx="7"/><rect x="395" y="35" width="310" height="215" rx="7"/><rect x="782" y="35" width="310" height="215" rx="7"/></g>
<g font-size="17" font-weight="600"><text x="25" y="23">REAL-WORLD TASK</text><text x="412" y="23">FORMAL MODEL</text><text x="799" y="23">ESTIMATE AND PREDICT</text></g>
<g stroke="#92979f" stroke-width="2" marker-end="url(#arrow)"><path d="M326 138H384"/><path d="M713 138H771"/></g>
<g stroke="#2563eb" stroke-width="3" fill="none"><path d="M38 115L83 73L128 115M47 108V162H119V108M73 162V130H94V162"/></g>
<text x="145" y="104" font-size="15">Area → sale price</text><text x="145" y="132" font-size="15">50 m² → 3.1</text><text x="145" y="158" font-size="15">80 m² → 4.8</text>
<text x="27" y="205" font-size="17">What price for a new house?</text><text x="27" y="230" font-size="12" fill="#717780">Illustrative data; prices in arbitrary units.</text>
<text x="418" y="112" font-size="25" fill="#2563eb">y = w₀ + w₁x + ε</text><text x="418" y="155" font-size="17">Features x, unknown weights w</text><text x="418" y="195" font-size="16">Noise describes variation</text><text x="418" y="220" font-size="16">between individual sales.</text>
<text x="805" y="102" font-size="18">Fit residuals → least squares</text><text x="805" y="140" font-size="18">Add noise model → MLE</text><text x="805" y="178" font-size="18">Add prior → posterior / MAP</text><text x="805" y="220" font-size="18" fill="#2563eb">New house → predictive price</text>
</g></svg>''')
print('Wrote four SVG figures and their numerical provenance.')
