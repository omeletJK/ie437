/* ============================================================
   widget: mbo-papers                         (Chapters 5 and 6)
   The papers of a lecture on one map: which stream each belongs to,
   why the lecture reads it, and how it connects to the others.
   Columns are the chapter's streams; lines are the relations the
   lecture actually uses. Click a paper for what it does, why it is
   here, and its relations.

   opts.set   'ch05' (default) — the problem and three surrogate streams
              'ch06'           — generative models and the four places
                                 to intervene (G1–G4), with the lab's papers
   opts.start 1 opens on Session 2.
   Lines: solid = builds on (uses the mechanism or extends the paper);
   dashed = compared with. A grey tag on a paper marks a setting that is
   not strictly offline (reward calls, measured rounds, BO).
   Walked by the deck's ->:
     0  Session 1's columns
     1  Session 2's columns, and how they tie back
   Attributions follow the papers themselves (venues and author lists
   checked 2026-10-11; the lab's against the KAIST SILAB list and the
   proceedings pages).
   ============================================================ */
IE437.widget('mbo-papers', function (host, opts) {
  var NS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#B45309';
  var MONO = "'IBM Plex Mono', monospace", SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";

  /* ---------------- Chapter 5: the problem and three streams ---------------- */
  /* role: core (taught in depth) | cmp (compared, one slide) | lab (our lab) | out (another lecture) */
  var CH05 = {
    title: 'Three streams, thirteen papers',
    W: 1104, H: 342, NW: 186, NH: 44,
    CX: [118, 388, 660, 932], RY: [62, 124, 186, 248, 310],
    COLS: [
      { t: 'The problem', s: 'Session 1', ses: 0 }, { t: 'Conservatism', s: 'Session 1', ses: 0 },
      { t: 'Uncertainty', s: 'Session 2', ses: 1 }, { t: 'System knowledge', s: 'Session 2', ses: 1 }],
    legend: { x: 25, y: 228, items: [['core', 'taught in depth'], ['cmp', 'compared, one slide'], ['out', 'leads to another lecture'],
      ['edge', 'builds on'], ['edgec', 'compared with']] },
    notes: [['db', 'every method here is scored on it']], tryXY: [572, 270],
    P: {
      adv: { c: 0, r: 0, role: 'cmp', t: 'Adversarial examples', v: 'ICLR 2015',
        full: 'Goodfellow, Shlens & Szegedy — Explaining and Harnessing Adversarial Examples',
        what: 'A tiny perturbation, chosen by following a gradient, flips a classifier’s answer.',
        why: 'It is the mechanism of Act 1: gradient search finds the inputs where a model is wrong.',
        rel: 'COMs turns it around — it generates the attack during training and trains the surrogate against it.' },
      db: { c: 0, r: 1, role: 'cmp', t: 'Design-Bench', v: 'ICML 2022',
        full: 'Trabucco, Geng, Kumar & Levine — Design-Bench: Benchmarks for Data-Driven Offline MBO',
        what: 'Offline tasks with hidden oracles and a common protocol: return 128 candidates, score them afterwards.',
        why: 'It defines what “offline” means in practice and is the yardstick every method here reports on.',
        rel: 'Same group as COMs; the lecture uses the 2021 versions of its tasks, as the COMs, NEMO and RoMA papers did.' },
      coms: { c: 1, r: 0, role: 'core', t: 'COMs', v: 'ICML 2021',
        full: 'Trabucco, Kumar, Geng & Levine — Conservative Objective Models for Effective Offline MBO',
        what: 'Trains the surrogate to under-rate the designs its own ascent would reach, then searches it slowly with a trust region.',
        why: 'The clearest conservative surrogate — Session 1 works it through: loss, algorithm, guarantee, limits.',
        rel: 'The one-step counterpart of CQL; PRIME applies it to chips; RoMA and NEMO answer the same failure with other levers; LCOMs moves it into a latent space.' },
      prime: { c: 1, r: 1, role: 'cmp', t: 'PRIME', v: 'ICLR 2022',
        full: 'Kumar, Yazdanbakhsh, Hashemi, Swersky & Levine — Data-Driven Offline Optimization for Architecting Hardware Accelerators',
        what: 'A COMs-style conservative model of accelerator latency, with infeasible designs as extra negatives and many target applications at once.',
        why: 'Conservatism in a real engineering pipeline, run from a log of past simulations.',
        rel: 'Builds directly on COMs.' },
      roma: { c: 1, r: 2, role: 'cmp', t: 'RoMA', v: 'NeurIPS 2021',
        full: 'Yu, Ahn, Song & Shin — RoMA: Robust Model Adaptation for Offline MBO',
        what: 'Smooths the surrogate — input noise and worst-case weight perturbations — and re-smooths it at every candidate.',
        why: 'A different lever for the same failure: it changes the surrogate’s shape, not its level.',
        rel: 'Contemporary of COMs, compared with it on the same benchmark.' },
      cql: { c: 1, r: 3, role: 'out', t: 'CQL  → Lecture 12', v: 'NeurIPS 2020',
        full: 'Kumar, Zhou, Tucker & Levine — Conservative Q-Learning for Offline Reinforcement Learning',
        what: 'Pushes Q-values down on actions the data does not contain and holds them up on actions it does.',
        why: 'The same disease with a policy in place of the optimiser — Lecture 12 takes it up.',
        rel: 'COMs has the same objective shape, one step instead of a sequence; same group, a year earlier.' },
      lcoms: { c: 1, r: 4, role: 'out', t: 'LCOMs  → Lecture 6', v: 'ICLR 2023 workshop',
        full: 'Qi, Geng, Rando, Ohama, Kumar & Levine — Latent Conservative Objective Models for Crystal Structure Prediction',
        what: 'A conservative surrogate of crystal energy, searched inside a VAE’s latent space.',
        why: 'The bridge to Lecture 6: a generative model supplies the space, a conservative surrogate searches it.',
        rel: 'COMs inside a learned representation.' },
      ens: { c: 2, r: 0, role: 'core', t: 'Deep Ensembles', v: 'NeurIPS 2017',
        full: 'Lakshminarayanan, Pritzel & Blundell — Simple and Scalable Predictive Uncertainty Estimation using Deep Ensembles',
        what: 'Train several networks; their disagreement estimates how much the model does not know.',
        why: 'The standard σ behind the offline rule μ − κσ — Lecture 4’s UCB with the sign turned.',
        rel: 'NEMO argues that ensembles stay confident off the data; Ovadia et al. measure how such estimates degrade under shift.' },
      nemo: { c: 2, r: 1, role: 'cmp', t: 'NEMO', v: 'ICLR 2021',
        full: 'Fu & Levine — Offline Model-Based Optimization via Normalized Maximum Likelihood Estimation',
        what: 'Normalised maximum likelihood: uncertainty as how easily the model could be talked into any label at a design.',
        why: 'An uncertainty estimate built for offline MBO rather than borrowed from prediction.',
        rel: 'The same failure as COMs, answered with uncertainty instead of a penalty (same group and year); its foil is the over-confident ensemble.' },
      ovd: { c: 2, r: 2, role: 'cmp', t: 'Uncertainty under shift', v: 'NeurIPS 2019',
        full: 'Ovadia et al. — Can You Trust Your Model’s Uncertainty? Evaluating Predictive Uncertainty Under Dataset Shift',
        what: 'Benchmarks uncertainty methods as the test data drift away from the training data.',
        why: 'Calibration degrades with shift for every method — even ensembles, the strongest there. The limit of the uncertainty stream.',
        rel: 'Not an MBO paper; it stress-tests the estimates the offline rule relies on.' },
      fgm: { c: 3, r: 0, role: 'core', t: 'Functional graphical models', v: 'AISTATS 2024',
        full: 'Grudzien Kuba, Uehara, Abbeel & Levine — Functional Graphical Models: Structure Enables Offline Data-Driven Optimization',
        what: 'If f splits over small groups of inputs, offline optimisation needs coverage of each group, not of the whole space.',
        why: 'The clearest statement of when knowledge lets us beat the best design in the data — slide 7’s question.',
        rel: 'Uses graphical-model structure (Lecture 3); the structure may also be inferred from data.' },
      ko: { c: 3, r: 1, role: 'cmp', t: 'Kennedy & O’Hagan', v: 'JRSS-B 2001',
        full: 'Kennedy & O’Hagan — Bayesian Calibration of Computer Models',
        what: 'A simulator plus a Gaussian process for the simulator’s error.',
        why: 'The classic way to put a physics model inside a surrogate.',
        rel: 'Lecture 4’s GP as the discrepancy term; a calibration paper, not an MBO algorithm.' },
      hpinn: { c: 3, r: 2, role: 'cmp', t: 'Hard-constraint PINN', v: 'SIAM J. Sci. Comput. 2021',
        full: 'Lu, Pestourie, Yao, Wang, Verdugo & Johnson — Physics-Informed Neural Networks with Hard Constraints for Inverse Design',
        what: 'Inverse design with the governing equations and hard constraints built into the network.',
        why: 'The most knowledge one can inject: the equations themselves.',
        rel: 'Adjacent inverse-design work; it needs a known PDE.' }
    },
    REL: [
      ['adv', 'coms', 'the attack it|trains against', 'h'],
      ['coms', 'prime', 'applied to chips', 'v'],
      ['coms', 'roma', 'shape, not level', 'gut', 0, 'cmp'],
      ['coms', 'cql', 'same objective shape', 'gut', 1],
      ['coms', 'lcoms', 'inside a latent space', 'gut', 2],
      ['coms', 'nemo', 'same failure,|another lever', 'd', 0, 'cmp'],
      ['ens', 'nemo', 'its foil', 'v', 0, 'cmp'],
      ['ens', 'ovd', 'stress-tested under shift', 'arc', 0, 'cmp'],
      ['fgm', 'ko', 'know a simulator', 'v', 0, 'cmp'],
      ['ko', 'hpinn', 'know the equations', 'v', 0, 'cmp']
    ],
    info: [
      '<b>Session 1.</b> One mechanism (adversarial examples), one yardstick (Design-Bench), one method in depth (COMs) — and what grows out of it: an application (PRIME), an alternative (RoMA), and two papers that the course meets again (CQL, LCOMs). Click a paper.',
      '<b>Session 2.</b> Uncertainty: estimate it (ensembles), build it for MBO (NEMO), know its limit (dataset shift). System knowledge, by how much is known: structure (FGM), a simulator (Kennedy & O’Hagan), the equations (PINN). Most of these papers — CQL, COMs, NEMO, PRIME, Design-Bench, LCOMs, FGM — come from one research programme (Levine’s group, Berkeley).'
    ]
  };

  /* ---------------- Chapter 6: four places to intervene ---------------- */
  var CH06 = {
    title: 'Four places to intervene, eighteen papers',
    W: 1104, H: 342, NW: 170, NH: 44,
    CX: [100, 326, 552, 778, 1004], RY: [62, 124, 186, 248, 310],
    COLS: [
      { t: 'Generators', s: 'Session 1', ses: 0 }, { t: 'G1 · coordinates', s: 'Session 1', ses: 0 },
      { t: 'G2 · distribution', s: 'Session 1', ses: 0 }, { t: 'G3 · condition', s: 'Session 2', ses: 1 },
      { t: 'G4 · sampler', s: 'Session 2', ses: 1 }],
    legend: { x: 241, y: 232, items: [['core', 'taught in depth'], ['cmp', 'compared, one slide'],
      ['lab', 'our lab'], ['out', 'from another lecture'], ['edge', 'builds on'], ['edgec', 'compared with']] },
    notes: [], tryXY: [1004, 284],
    P: {
      vae: { c: 0, r: 0, role: 'core', t: 'VAE', v: 'ICLR 2014',
        full: 'Kingma & Welling — Auto-Encoding Variational Bayes',
        what: 'An encoder maps a design to a code and a decoder maps codes back, trained by the ELBO so that codes drawn from N(0, I) decode to plausible designs.',
        why: 'The clearest generative model with an explicit latent space — the coordinates G1 searches.',
        rel: 'Gómez-Bombarelli et al. search its latent space; a diffusion model is a VAE stacked many times with a fixed encoder.' },
      ddpm: { c: 0, r: 1, role: 'core', t: 'DDPM', v: 'NeurIPS 2020',
        full: 'Ho, Jain & Abbeel — Denoising Diffusion Probabilistic Models',
        what: 'Corrupt a design with Gaussian noise in many small steps, learn to predict the noise, and generate by removing it one step at a time.',
        why: 'The generator behind most current generative design methods — DDOM, GTG, RGD and the lab’s wind-farm and road-network work.',
        rel: 'Steered either by a separate classifier or by a conditional model of its own (the two papers below).' },
      cg: { c: 0, r: 2, role: 'cmp', t: 'Classifier guidance', v: 'NeurIPS 2021', tag: '→ G4',
        full: 'Dhariwal & Nichol — Diffusion Models Beat GANs on Image Synthesis',
        what: 'Adds the gradient of a classifier trained on noisy inputs to every denoising step; a scale s sets how hard it pushes.',
        why: 'The principle of G4: a separate model of y steers the sampler — and in design, that model is a surrogate.',
        rel: 'G4 methods inherit its power and Lecture 5’s risk: the steering model is exploited where it is wrong.' },
      cfg: { c: 0, r: 3, role: 'cmp', t: 'Classifier-free guidance', v: 'NeurIPS 2021 workshop', tag: '→ G3',
        full: 'Ho & Salimans — Classifier-Free Diffusion Guidance',
        what: 'One model is trained with and without the condition; sampling extrapolates from the unconditional prediction toward the conditional one, with weight w.',
        why: 'Steering without a separate classifier — the sampler of the G3 methods DDOM and GTG.',
        rel: 'RGD lets a proxy choose its weight w, and nothing else.' },
      gb: { c: 1, r: 0, role: 'core', t: 'Latent-space search', v: 'ACS Cent. Sci. 2018',
        full: 'Gómez-Bombarelli et al. — Automatic Chemical Design Using a Data-Driven Continuous Representation of Molecules',
        what: 'A VAE turns molecules into continuous codes with a property predictor on the codes; search the codes by gradient steps or Bayesian optimisation, then decode.',
        why: 'The clearest case of moving the search into learned coordinates — met in Lecture 4 for its dimension, here for its validity.',
        rel: 'Many decoded codes are not valid molecules: JT-VAE makes validity structural; LCOMs makes the latent surrogate conservative.' },
      jt: { c: 1, r: 1, role: 'cmp', t: 'JT-VAE', v: 'ICML 2018',
        full: 'Jin, Barzilay & Jaakkola — Junction Tree Variational Autoencoder for Molecular Graph Generation',
        what: 'Generates a molecule as a tree of chemically valid substructures, then assembles them, so every output is a valid molecule.',
        why: 'Validity by construction rather than by luck: the coordinates themselves exclude invalid designs.',
        rel: 'It fixes G1’s validity problem; it does not make the property predictor honest away from the data.' },
      lcoms: { c: 1, r: 2, role: 'out', t: 'LCOMs  ← Lecture 5', v: 'ICLR 2023 workshop',
        full: 'Qi, Geng, Rando, Ohama, Kumar & Levine — Latent Conservative Objective Models for Crystal Structure Prediction',
        what: 'A conservative surrogate (COMs) of crystal energy, searched in a VAE’s latent space.',
        why: 'G1 plus Lecture 5: learned coordinates for validity, a conservative surrogate for trust.',
        rel: 'COMs inside a learned representation.' },
      cbas: { c: 2, r: 0, role: 'core', t: 'CbAS', v: 'ICML 2019',
        full: 'Brookes, Park & Listgarten — Conditioning by Adaptive Sampling for Robust Design',
        what: 'Fits a generative model to p(x | success) by refitting it, round after round, to its own samples weighted by prior ÷ proposal × P(success | x).',
        why: 'The clearest statement of G2 — move the distribution, not a point — and Session 1’s worked derivation.',
        rel: 'BootGen also refits a generator on its own, proxy-scored samples.' },
      bootgen: { c: 2, r: 1, role: 'lab', t: 'BootGen', v: 'NeurIPS 2023',
        full: 'Kim, Berto, Ahn & Park — Bootstrapped Training of Score-Conditioned Generator for Offline Design of Biological Sequences',
        what: 'A score-conditioned generator trained with rank-based weights, then retrained on its own samples that a proxy scores highest; several generators are trained this way and their samples pooled.',
        why: 'Our lab’s answer to a generator that does not reach high scores: refit it on its own best samples, as CbAS does.',
        rel: 'G2 because it refits the generating distribution; G3 because the generator is conditioned on a score.' },
      gfn: { c: 2, r: 2, role: 'cmp', set: 'reward calls',  t: 'GFlowNet', v: 'NeurIPS 2021',
        full: 'Bengio, Jain, Korablyov, Precup & Bengio — Flow Network based Generative Models for Non-Iterative Diverse Candidate Generation',
        what: 'Builds a design step by step and trains the steps so that a finished design is drawn with probability proportional to its reward.',
        why: 'Sample in proportion to reward instead of maximising it — many good candidates, not one. Trained by flow consistency, it needs reward calls or a learned proxy.',
        rel: 'The lab’s Genetic-guided GFlowNets adds a genetic search; DiBO (Lecture 4) uses a loss from the same family to fine-tune a diffusion model.' },
      ggfn: { c: 2, r: 3, role: 'lab', set: 'online',  t: 'Genetic-guided GFlowNets', v: 'NeurIPS 2024',
        full: 'Kim, Kim, Choi & Park — Genetic-guided GFlowNets for Sample Efficient Molecular Optimization',
        what: 'A GFlowNet whose training is guided by a genetic search, for molecular optimisation with a limited number of reward calls.',
        why: 'Sample efficiency when every reward call is an expensive oracle query.',
        rel: 'Not offline: it queries the oracle within a budget — Lecture 4’s setting.' },
      mins: { c: 3, r: 0, role: 'core', t: 'MINs', v: 'NeurIPS 2020',
        full: 'Kumar & Levine — Model Inversion Networks for Model-Based Optimization',
        what: 'Learns an inverse map x = f⁻¹(y, z), trained with weights that favour high scores; asks for the highest y that an independent forward model still confirms.',
        why: 'The first inverse method for offline MBO — and it still needs a forward model to decide how far to ask.',
        rel: 'DDOM keeps its reweighting and replaces the inverse map with a diffusion model.' },
      ddom: { c: 3, r: 1, role: 'core', t: 'DDOM', v: 'ICML 2023',
        full: 'Krishnamoorthy, Mashkaria & Grover — Diffusion Models for Black-Box Optimization',
        what: 'A conditional diffusion model of x given y, trained on reweighted data and sampled with classifier-free guidance, conditioned on the best score in the dataset.',
        why: 'The one-to-many inverse handled properly: diffusion keeps every mode a unimodal inverse would average.',
        rel: 'No proxy at all; GTG conditions a trajectory instead of a point, and RGD adds a proxy.' },
      gtg: { c: 3, r: 2, role: 'lab', t: 'GTG', v: 'NeurIPS 2024',
        full: 'Yun, Yun, Lee & Park — Guided Trajectory Generation with Diffusion Models for Offline Model-based Optimization',
        what: 'Builds synthetic trajectories toward high-scoring regions from the data, trains a diffusion model to generate trajectories conditioned on their score, samples with guidance, and keeps the candidates a proxy rates highest.',
        why: 'Ask for an improvement, not a point: the condition carries a direction away from where the data are.',
        rel: 'G3 with a richer condition; the proxy only filters the final candidates.' },
      wind: { c: 3, r: 3, role: 'lab', set: 'offline → online',  t: 'Wind-farm layouts', v: 'KDD 2025',
        full: 'Shin, Yun, Yun, Woo, Lim & Park — Wind Farm Layout Optimization with Diffusion Models',
        what: 'A diffusion model with a graph-network denoiser, conditioned on high annual energy production and the wind scenario; local search repairs constraint violations; new layouts are evaluated and added to the data, and the loop repeats.',
        why: 'G3 on a real design problem — and the loop Lecture 4 would close: generate, evaluate, augment.',
        rel: 'Offline to online: every round adds measured layouts.' },
      rgd: { c: 4, r: 0, role: 'core', t: 'RGD', v: 'TMLR 2024',
        full: 'Chen, Beckham, Liu, Liu & Pal — Robust Guided Diffusion for Offline Black-Box Optimization',
        what: 'Classifier-free diffusion whose guidance strength is tuned by a proxy, and a proxy refined with the help of the diffusion model.',
        why: 'G4 done with Lecture 5 in mind: the proxy is unreliable off the data, so it is given one knob.',
        rel: 'Combines classifier-free guidance with a proxy without letting the proxy’s gradient steer every step.' },
      nos: { c: 4, r: 1, role: 'cmp', set: 'BO, lab rounds',  t: 'NOS / LaMBO-2', v: 'NeurIPS 2023',
        full: 'Gruver, Stanton, Frey, Rudner, Hotzel, Lafrance-Vanasse, Rajpal, Cho & Wilson — Protein Design with Guided Discrete Diffusion',
        what: 'Guides a discrete diffusion model of protein sequences with gradients taken in its continuous hidden states (NOS), inside LaMBO-2, a Bayesian-optimisation procedure.',
        why: 'Guidance where designs are discrete — sequences — by moving the gradient into a continuous space.',
        rel: 'An application with wet-lab rounds, not offline MBO; the lab’s road-network work also guides a discrete diffusion model.' },
      traffic: { c: 4, r: 2, role: 'lab', set: 'evaluated',  t: 'Road-network layouts', v: 'WSDM 2026',
        full: 'Yun, Song, Shin, Shin, Woo, Lim & Park — Urban Traffic Network Layout Optimization with Guided Discrete Diffusion Models',
        what: 'A guided discrete diffusion model generates urban road-network layouts for a given traffic pattern.',
        why: 'G4 at city scale, where a design is a graph rather than a vector.',
        rel: 'Guided discrete diffusion, as in NOS.' }
    },
    REL: [
      ['vae', 'gb', 'its latent|space', 'h'],
      ['vae', 'ddpm', 'a stacked VAE', 'v'],
      ['ddpm', 'cg', 'steer: a classifier', 'v'],
      ['cg', 'cfg', '… or none', 'v', 0, 'cmp'],
      ['gb', 'jt', 'valid by construction', 'v', 0, 'cmp'],
      ['gb', 'lcoms', '+ a conservative surrogate', 'gut', 0],
      ['cbas', 'bootgen', 'refit on own samples', 'v', 0, 'cmp'],
      ['gfn', 'ggfn', '+ genetic search', 'v'],
      ['bootgen', 'ddom', 'G3 too', 'h', 0, 'cmp'],
      ['mins', 'ddom', 'same reweighting', 'v'],
      ['ddom', 'gtg', 'trajectories', 'v'],
      ['ddom', 'wind', 'condition, then measure', 'gut', 0],
      ['ddom', 'rgd', '+ a proxy|knob', 'd'],
      ['nos', 'traffic', 'discrete diffusion', 'v', 0, 'cmp']
    ],
    info: [
      '<b>Session 1.</b> Two generative models (VAE, DDPM) and the two ways to steer one — then two places to intervene: the <b>coordinates</b> a search moves in (G1) and the <b>distribution</b> designs are drawn from (G2). Filled boxes are taught in depth, amber ones are our lab’s; a solid line builds on, a dashed one compares. Click a paper.',
      '<b>Session 2.</b> Two more places: the <b>performance</b> a generator is asked for (G3) and <b>each step</b> of its sampler (G4). The two guidance papers on the left are their mechanisms — classifier-free guidance drives G3, classifier guidance drives G4. Grey tags mark papers that are not strictly offline. Our lab’s papers carry each intervention to a design problem: sequences, molecules, wind farms, road networks.'
    ]
  };

  var C = opts.set === 'ch06' ? CH06 : CH05;
  var W = C.W, H = C.H, NW = C.NW, NH = C.NH, CX = C.CX, RY = C.RY, COLS = C.COLS, P = C.P, REL = C.REL;
  var st = 0, sel = null;

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + C.title + '</span>' +
    '<span class="wspacer"></span></div>' +
    '<div class="wbody" style="gap:6px;padding:8px 12px"><div data-g></div>' +
    '<div data-i style="min-height:58px;font:400 12px/1.45 var(--sans);color:var(--ink2);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:7px"></div></div>';
  var G = host.querySelector('[data-g]'), INFO = host.querySelector('[data-i]');
  var sv = S('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G);
  sv.style.display = 'block';
  sv.setAttribute('data-try-anchor', ''); sv.setAttribute('data-try-x', C.tryXY[0]); sv.setAttribute('data-try-y', C.tryXY[1]);

  function on(k) { return COLS[P[k].c].ses <= st; }
  function box(k) { var p = P[k]; return { x: CX[p.c] - NW / 2, y: RY[p.r] - NH / 2, cx: CX[p.c], cy: RY[p.r] }; }
  function look(role, out) {                       /* fill, stroke, text colour, dash */
    if (role === 'core') return { f: BLUE, s: BLUE, t: '#fff', v: '#fff', d: '' };
    if (role === 'lab') return { f: '#FEF3C7', s: '#D97706', t: INK, v: AMBER, d: out ? '5 3' : '' };
    return { f: '#fff', s: 'rgba(22,24,29,.35)', t: INK, v: SLATE, d: role === 'out' || out ? '5 3' : '' };
  }

  function render() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    S('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff', 'fill-opacity': 0 }, sv);
    /* column heads */
    COLS.forEach(function (c, i) {
      var vis = c.ses <= st;
      S('text', { x: CX[i] - NW / 2, y: 18, 'font-size': 13, 'font-weight': 700, fill: INK, 'fill-opacity': vis ? 1 : .3,
        'font-family': SANS, text: c.t }, sv);
      S('text', { x: CX[i] + NW / 2, y: 18, 'text-anchor': 'end', 'font-size': 9.5, fill: SLATE, 'fill-opacity': vis ? .9 : .3,
        'font-family': MONO, text: c.s.toUpperCase() }, sv);
      S('line', { x1: CX[i] - NW / 2, x2: CX[i] + NW / 2, y1: 27, y2: 27, stroke: INK, 'stroke-opacity': vis ? .25 : .08 }, sv);
    });
    /* relations, under the nodes */
    REL.forEach(function (e) {
      var a = box(e[0]), b = box(e[1]), vis = on(e[0]) && on(e[1]);
      if (!vis) return;
      var hot = sel && (sel === e[0] || sel === e[1]);
      var col = hot ? BLUE : SLATE, op = sel && !hot ? .25 : .85, d, lx, ly, anchor = 'start';
      if (e[3] === 'h') {
        d = 'M' + (a.x + NW) + ' ' + a.cy + 'L' + (b.x - 6) + ' ' + b.cy;
        lx = (a.x + NW + b.x) / 2; ly = a.cy - 7; anchor = 'middle';
      } else if (e[3] === 'v') {
        d = 'M' + a.cx + ' ' + (a.y + NH) + 'L' + b.cx + ' ' + (b.y - 5);
        lx = a.cx + 8; ly = (a.y + NH + b.y) / 2 + 4;
      } else if (e[3] === 'd') {
        d = 'M' + (a.x + NW) + ' ' + (a.cy + 8) + 'L' + (b.x - 6) + ' ' + b.cy;
        lx = (a.x + NW + b.x) / 2 + 2; ly = a.cy - 8; anchor = 'middle';
      } else if (e[3] === 'arc') {
        var xr = a.x + NW + 14;
        d = 'M' + (a.x + NW) + ' ' + a.cy + 'L' + xr + ' ' + a.cy + 'L' + xr + ' ' + b.cy + 'L' + (b.x + NW + 5) + ' ' + b.cy;
        lx = b.x + NW - 2; ly = b.y - 6; anchor = 'end';
      } else {                                     /* down the left gutter of the column */
        var xg = a.x - 12 - 9 * e[4];
        d = 'M' + a.x + ' ' + (a.cy + 6 + 4 * e[4]) + 'L' + xg + ' ' + (a.cy + 6 + 4 * e[4]) + 'L' + xg + ' ' + b.cy + 'L' + (b.x - 6) + ' ' + b.cy;
        lx = b.x + 2; ly = b.y - 6;
      }
      S('path', { d: d, fill: 'none', stroke: col, 'stroke-width': hot ? 2 : 1.4, 'stroke-opacity': op,
        'stroke-dasharray': e[5] === 'cmp' ? '4 3' : '', 'marker-end': 'url(#mp-arrow' + (hot ? '-hot' : '') + ')' }, sv);
      e[2].split('|').forEach(function (ln, j, all) {
        S('text', { x: lx, y: ly - 11 * (all.length - 1 - j), 'text-anchor': anchor, 'font-size': 10, 'font-style': 'italic',
          fill: hot ? BLUE : INK, 'fill-opacity': sel && !hot ? .3 : .78, 'font-family': SANS, text: ln }, sv);
      });
    });
    /* arrow heads */
    var defs = S('defs', {}, sv);
    [['mp-arrow', SLATE], ['mp-arrow-hot', BLUE]].forEach(function (m) {
      var mk = S('marker', { id: m[0], viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
      S('path', { d: 'M0 0L8 4L0 8z', fill: m[1] }, mk);
    });
    /* nodes */
    Object.keys(P).forEach(function (k) {
      var p = P[k], b = box(k), vis = on(k), isSel = sel === k, L = look(p.role, p.out);
      var g = S('g', { cursor: 'pointer', opacity: vis ? (sel && !isSel ? .75 : 1) : .2 }, sv);
      S('rect', { x: b.x, y: b.y, width: NW, height: NH, rx: 8, fill: L.f, stroke: isSel ? INK : L.s,
        'stroke-width': isSel ? 2.5 : 1.2, 'stroke-dasharray': L.d }, g);
      S('text', { x: b.x + 10, y: b.y + 19, 'font-size': p.t.length > 21 ? 11.5 : 12.5, 'font-weight': 700, 'font-family': SANS,
        fill: L.t, text: p.t }, g);
      S('text', { x: b.x + 10, y: b.y + 35, 'font-size': 9.5, 'font-family': MONO,
        fill: L.v, 'fill-opacity': p.role === 'core' ? .9 : 1, text: p.v }, g);
      if (p.set) {                                 /* setting badge: not strictly offline */
        var bw = p.set.length * 5.3 + 10;
        S('rect', { x: b.x + NW - bw - 4, y: b.y + 26, width: bw, height: 13, rx: 3, fill: SLATE, 'fill-opacity': .14 }, g);
        S('text', { x: b.x + NW - bw / 2 - 4, y: b.y + 35.5, 'text-anchor': 'middle', 'font-size': 8.5, 'font-family': MONO,
          fill: INK, 'fill-opacity': .7, text: p.set }, g);
      }
      if (p.tag) S('text', { x: b.x + NW + 6, y: b.cy + 4, 'font-size': 10.5, 'font-weight': 700, 'font-style': 'italic',
        fill: BLUE, 'fill-opacity': vis ? .85 : .3, 'font-family': SANS, text: p.tag }, sv);
      if (vis) g.addEventListener('click', function (ev) { ev.stopPropagation(); sel = sel === k ? null : k; render(); });
    });
    /* notes under nodes, and a legend */
    C.notes.forEach(function (n) {
      var nb = box(n[0]);
      S('text', { x: nb.x, y: nb.y + NH + 16, 'font-size': 9.5, 'font-style': 'italic', fill: SLATE, 'font-family': SANS,
        text: n[1] }, sv);
    });
    C.legend.items.forEach(function (it, i) {
      var y = C.legend.y + i * (C.legend.items.length > 4 ? 17 : C.legend.items.length > 3 ? 22 : 24), L = look(it[0]);
      if (it[0] === 'edge' || it[0] === 'edgec') {
        S('line', { x1: C.legend.x, x2: C.legend.x + 26, y1: y - 3, y2: y - 3, stroke: SLATE, 'stroke-width': 1.4,
          'stroke-dasharray': it[0] === 'edgec' ? '4 3' : '' }, sv);
        S('text', { x: C.legend.x + 34, y: y + 1, 'font-size': 10.5, fill: INK, 'font-family': SANS, text: it[1] }, sv);
        return;
      }
      S('rect', { x: C.legend.x, y: y - 11, width: 26, height: 13, rx: 4, fill: L.f, stroke: L.s,
        'stroke-dasharray': it[0] === 'out' ? '4 2' : '' }, sv);
      S('text', { x: C.legend.x + 34, y: y + 1, 'font-size': 10.5, fill: INK, 'font-family': SANS, text: it[1] }, sv);
    });

    var info;
    if (sel) {
      var p = P[sel];
      info = '<b>' + p.full + '</b> <span style="font-family:var(--mono);font-size:11px;color:var(--ink3)">· ' + p.v + '</span><br>' +
        '<b style="color:var(--ink)">What it does.</b> ' + p.what + ' &nbsp;<b style="color:var(--ink)">Why we read it.</b> ' + p.why +
        ' &nbsp;<b style="color:var(--ink)">How it connects.</b> ' + p.rel;
    } else info = C.info[st];
    INFO.innerHTML = info;
  }
  var ST0 = opts.start === 1 ? 1 : 0;              /* a mount can open on Session 2 */
  var show = function (i) { st = Math.max(0, Math.min(1, ST0 + i)); sel = null; render(); };
  show(0);
  return { steps: 1 - ST0, step: show, reset: function () { show(0); }, finish: function () { show(1); } };
});
