"""Stage the reviewed public examples and publisher in the course repository."""
from pathlib import Path
import json
import shutil
import re

here = Path(__file__).resolve().parent
package = here.parent / 'student'
course = Path('/Users/jinkyoo/Projects/ie437-slides')
catalog = (here / '_WORKED_EXAMPLES.md').read_text()
names = re.findall(r'^      - (.+)$', catalog, re.M)
if len(names) != 31 or len(set(names)) != len(names):
    raise ValueError('Expected 31 distinct public package files')
for name in names:
    if not all(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', part) for part in name.split('/')) or not re.search(r'\.(html|md|json|csv|xlsx|js|css|svg|png|jpg|woff2)$', name):
        raise ValueError(f'Invalid public package path: {name}')


def checked_file(filename, base, required=True):
    """Reject symlinks, non-directory ancestors, and paths outside the base."""
    filename = filename.absolute()
    for current in [*reversed(filename.parents), filename]:
        if current.is_symlink():
            raise ValueError(f'Symlink is not permitted: {current}')
        if current.exists() and current != filename and not current.is_dir():
            raise ValueError(f'Expected a directory: {current}')
    try:
        filename.resolve().relative_to(base.resolve())
    except ValueError as error:
        raise ValueError(f'Path escapes the package boundary: {filename}') from error
    if (required or filename.exists()) and not filename.is_file():
        raise ValueError(f'Expected a regular file: {filename}')
    return filename


def replace_once(source, old, new, label):
    if source.count(old) != 1:
        raise ValueError(f'Expected exactly one {label} patch anchor')
    return source.replace(old, new, 1)


destination = course / 'teaching/assignment-01-model-answer/student'
copies = [(checked_file(package / name, package), checked_file(destination / name, destination, False)) for name in names]
copies += [(checked_file(here / name, here), checked_file(course / target, course, False)) for name, target in (
    ('worked-examples.mjs', 'worked-examples.mjs'),
    ('_WORKED_EXAMPLES.md', 'md/_WORKED_EXAMPLES.md'),
    ('worked-examples-test.mjs', 'tests/worked-examples.mjs'),
)]

site = checked_file(course / 'site.mjs', course)
source = site.read_text()
if "import { publishWorkedExamples }" not in source:
    source = replace_once(source, "import { publishAssignments } from './assignments.mjs';", "import { publishAssignments } from './assignments.mjs';\nimport { publishWorkedExamples } from './worked-examples.mjs';", 'assignment import')
    source = replace_once(source, 'function assignmentRow(a) {', 'function assignmentRow(a, examples = []) {', 'assignment row')
    needle = "  </article></li>`;\n}\n\nexport function writeSite()"
    replacement = '''    ${examples.filter(e => e.assignment === a.number).map(e => `<div class="assignment-examples">
      <h4>Worked examples · MD + interactive demo + proposal</h4>
      <p>${esc(e.summary)}</p>
      <div class="assignment-example-actions"><a class="btn solid" href="${esc(e.startURL)}">Open worked examples</a><a class="btn ghost" href="${esc(e.archive.url)}" download="${esc(e.archive.name)}">${DL_ICON} Download examples ZIP</a></div>
    </div>`).join('')}
  </article></li>`;
}

export function writeSite()'''
    source = replace_once(source, needle, replacement, 'assignment article')
    source = replace_once(source, '  const assignments = publishAssignments(ROOT);', '  const assignments = publishAssignments(ROOT);\n  const examples = publishWorkedExamples(ROOT);', 'assignment publisher')
    source = replace_once(source, 'assignments.map(assignmentRow)', 'assignments.map(a => assignmentRow(a, examples))', 'assignment list')
for marker in ("import { publishWorkedExamples } from './worked-examples.mjs';", 'function assignmentRow(a, examples = []) {', 'const examples = publishWorkedExamples(ROOT);', 'assignments.map(a => assignmentRow(a, examples))', 'examples.filter(e => e.assignment === a.number)'):
    if source.count(marker) != 1:
        raise ValueError(f'Incomplete or duplicate site integration: {marker}')

style = checked_file(course / 'deck/site.css', course)
css = style.read_text()
if '.assignment-examples{' not in css:
    css += '''\n/* Public worked examples, separate from assignment requirements. */
.assignment-examples{margin-top:24px;padding-top:22px;border-top:1px solid var(--line)}
.assignment-examples h4{font-size:17px;color:var(--ink)}
.assignment-examples p{font-size:14px;color:var(--ink2);max-width:75ch;margin-top:8px}
.assignment-example-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
@media(max-width:600px){.assignment-example-actions{flex-direction:column;align-items:stretch}.assignment-example-actions .btn{justify-content:center}}
'''

package_file = checked_file(course / 'package.json', course)
config = json.loads(package_file.read_text())
if not isinstance(config.get('scripts'), dict):
    raise ValueError('Course package.json must contain scripts')
config['scripts']['test:worked-examples'] = 'node tests/worked-examples.mjs'

workflow = checked_file(course / '.github/workflows/pages.yml', course)
flow = workflow.read_text()
if "      - 'worked-examples.mjs'" not in flow:
    flow = replace_once(flow, "      - 'assignments.mjs'", "      - 'assignments.mjs'\n      - 'worked-examples.mjs'\n      - 'tests/worked-examples.mjs'", 'workflow source paths')
if '      - run: npm run test:worked-examples' not in flow:
    flow = replace_once(flow, '      - run: npm run test:assignments', '      - run: npm run test:assignments\n      - run: npm run test:worked-examples', 'workflow test step')
for marker in ("      - 'worked-examples.mjs'", "      - 'tests/worked-examples.mjs'", '      - run: npm run test:worked-examples'):
    if flow.count(marker) != 1:
        raise ValueError(f'Incomplete or duplicate workflow integration: {marker}')

readme = checked_file(course / 'README.md', course)
text = readme.read_text()
public_examples_section = '''## Public worked examples

Release 1.8 provides two English Assignment 1 worked examples: each has a Markdown/HTML definition, a proposal in its original visual design, one interactive app and an English guide. The Response proposal has 44 sections and the Audience proposal has 59. Case A slide 03 again shows the original forecasting/programming structure. One separate classroom-comparison.html page explains the brief-versus-case assumptions/data and proposed-versus-demonstrated scope before either proposal. The main proposals focus on the cinema solution and operator process. Both narratives now develop the operating problem, model, decision strategy and operating loop; detailed classroom assumptions and verification guidance live in case Markdown appendices and presenter notes. Main and extended-proposal compatibility copies remain identical within each case.

Case A is unchanged from the published 1.5 release. Case A imports complete planning JSON or five-column CSV, reviews operating rules, runs aggregate-response ILS from the uploaded reference and compares/exports results. Case B retains the existing movie-first M0 individual-consumer engine and restores its original 24-film annual sample, translated into English. Two films are released each month; theatrical runs cover every day of 2027. Their broader learning/BO/M1 proposals remain separate from demonstrated implementation. The public 1.5 default checks gave A 4,969 → 5,247; B's old two-film totals remain historical checks, separate from the annual catalog. The apps use synthetic data and different outcome units.

The reviewed catalog in `md/_WORKED_EXAMPLES.md` includes 31 public files. `node site.mjs` publishes them to `html/worked-examples/assignment-01-model-answer/` and builds its deterministic ZIP. Students enter through Assignments → Assignment 1 → Open worked examples. The hub links both definitions/MD downloads, proposals, apps, guides and planning samples; return links lead back to the hub. The existing Pages workflow builds and tests the entire site before deployment.

Previous packages and authoring audits remain outside the allowlist. Instructor notes and real student work are excluded. Release 1.8 restores the annual Case B fixture and its English instructions; preserve unrelated local lecture work when publishing. `npm run test:worked-examples` checks all public hashes, relative links, deck identities and publisher boundaries.
'''


def update_public_examples_readme(current, section):
    """Replace only this level-two section, preserving subsequent sections."""
    matches = list(re.finditer(r'^## Public worked examples[ \t]*\r?$', current, re.M))
    if len(matches) > 1:
        raise ValueError('Duplicate Public worked examples README sections')
    if not matches:
        separator = '' if not current or current.endswith('\n\n') else '\n' if current.endswith('\n') else '\n\n'
        return current + separator + section.rstrip() + '\n'
    match = matches[0]
    following = re.search(r'^#{1,2}[ \t]+\S', current[match.end():], re.M)
    end = match.end() + following.start() if following else len(current)
    suffix = current[end:]
    return current[:match.start()] + section.rstrip() + ('\n\n' if suffix else '\n') + suffix


text = update_public_examples_readme(text, public_examples_section)

# All paths and patch anchors have passed before the first course write.
for original, target in copies:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(original, target)
for target, content in ((site, source), (style, css), (package_file, json.dumps(config, indent=2, ensure_ascii=False) + '\n'), (workflow, flow), (readme, text)):
    if target.read_text() != content:
        target.write_text(content)
print(f'Staged {len(names)} public files and course-site integration. No lecture sources or instructor notes were edited.')
