/** Pure planning-package/CSV parser around the supported six-film SIM2 shape. */
export function createDatasetTools() {
  'use strict';
  const SCHEMA = 'ie437.response-planning.v1';
  const LIMIT = 2 * 1024 * 1024;
  const IDS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const FIXED = {
    nearbySameFilmMinutes: 90, nearbySameFilmFactor: 0.72,
    nearbyOtherFilmMinutes: 20, nearbyOtherFilmFactor: 0.94,
    dailySameFilmFactor: 0.93, dayBeforeMinute: 1020, primeFromMinute: 1080
  };
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const copy = value => JSON.parse(JSON.stringify(value));
  const clock = minute => String(Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0');
  function fail(errors, warnings = []) { return {ok: false, package: null, engine: null, summary: null, showingMetadata: [], originalShowingIds: [], errors, warnings}; }
  function inputError(code, path, message, row) { return Object.assign({code, path, message}, row ? {row} : {}); }
  function textSize(text) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    let bytes = 0;
    for (const char of text) { const point = char.codePointAt(0); bytes += point < 0x80 ? 1 : point < 0x800 ? 2 : point < 0x10000 ? 3 : 4; }
    return bytes;
  }
  function checkText(text, format) {
    if (typeof text !== 'string') return inputError('INPUT_TYPE', format, 'Provide ' + format + ' as text.');
    if (text.length > LIMIT || textSize(text) > LIMIT) return inputError('INPUT_TOO_LARGE', format, 'The planning file must be at most 2 MiB (2,097,152 bytes).');
    if (!text.trim()) return inputError('INPUT_EMPTY', format, 'The planning file is empty.');
    if (text.indexOf('\0') !== -1) return inputError('INPUT_NUL', format, 'The planning file contains a null character.');
    return null;
  }
  function validate(input) {
    const errors = [], warnings = [];
    const error = (code, path, message) => { if (errors.length < 100) errors.push(inputError(code, path, message)); };
    function fields(value, allowed, path) {
      for (const key of Object.keys(value)) if (!allowed.includes(key)) error('UNSUPPORTED_FIELD', path + (path ? '.' : '') + key, 'Unsupported field ' + key + '. It is not applied by this engine; remove it rather than assuming it affects the result.');
    }
    function number(value, path, options = {}) {
      const {min = 0, max = 1000000, integer = false, positive = false} = options;
      if (typeof value !== 'number' || !Number.isFinite(value) || (integer && !Number.isSafeInteger(value)) || value < min || value > max || (positive && value <= 0)) {
        error('NUMBER_RANGE', path, 'Expected a finite ' + (integer ? 'integer' : 'number') + ' ' + (positive ? 'greater than 0' : 'at least ' + min) + ' and at most ' + max + '.');
        return null;
      }
      return value;
    }
    function label(value, path, fallback) {
      if (value === undefined && fallback !== undefined) return fallback;
      if (typeof value !== 'string' || !value.trim() || value.trim().length > 80 || /[\u0000-\u001f\u007f]/.test(value)) {
        error('TEXT_LABEL', path, 'Expected nonempty plain text of at most 80 characters, without control characters.');
        return null;
      }
      return value.trim();
    }
    function stableId(value, path) {
      if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/.test(value)) {
        error('STABLE_ID', path, 'Use a stable ID of 1–80 letters, digits, underscores, hyphens, periods or colons, starting with a letter or digit.');
        return null;
      }
      return value;
    }
    function canonicalId(value, path) {
      if (typeof value !== 'string' || !/^[A-Fa-f]$/.test(value)) {
        error('CANONICAL_ID', path, 'This engine supports film/site IDs A–F. Names may be supplied separately; do not use names as IDs.');
        return null;
      }
      const id = value.toUpperCase();
      if (id !== value) warnings.push({code: 'ID_NORMALIZED', path, message: 'Normalized ID ' + value + ' to ' + id + '.'});
      return id;
    }
    function keyedNumbers(value, path, options) {
      if (!object(value)) { error('ID_MAP', path, 'Expected an object with exactly the film-ID keys A–F.'); return null; }
      const normalized = Object.create(null);
      for (const key of Object.keys(value)) {
        const id = canonicalId(key, path + '.' + key);
        if (!id) continue;
        if (own(normalized, id)) { error('DUPLICATE_ID', path, 'Duplicate normalized film ID ' + id + '.'); continue; }
        normalized[id] = number(value[key], path + '.' + key, options);
      }
      for (const id of IDS) if (!own(normalized, id)) error('MISSING_FILM_KEY', path, 'Missing value for film ' + id + '.');
      return Object.fromEntries(IDS.filter(id => own(normalized, id)).map(id => [id, normalized[id]]));
    }
    if (!object(input)) return fail([inputError('PACKAGE_TYPE', '$', 'The JSON planning package must be an object.')]);
    fields(input, ['schemaVersion', 'schema', 'title', 'films', 'sites', 'model', 'constraints', 'referenceShowings'], '');
    const schema = input.schemaVersion === undefined ? input.schema : input.schemaVersion;
    if (schema !== SCHEMA) error('SCHEMA_VERSION', 'schemaVersion', 'Expected schemaVersion "' + SCHEMA + '".');
    if (input.schemaVersion !== undefined && input.schema !== undefined && input.schemaVersion !== input.schema) error('SCHEMA_CONFLICT', 'schema', 'schema and schemaVersion disagree.');
    const title = label(input.title, 'title', 'Aggregate response planning package');
    if (!Array.isArray(input.films) || input.films.length !== 6) error('FILM_SHAPE', 'films', 'This engine requires exactly six films, with IDs A–F.');
    if (!Array.isArray(input.sites) || input.sites.length !== 6) error('SITE_SHAPE', 'sites', 'This engine requires exactly six sites, with IDs A–F.');
    if (!object(input.model)) error('MODEL_REQUIRED', 'model', 'Include the explicit response model and its declared coefficients.');
    if (!object(input.constraints)) error('CONSTRAINTS_REQUIRED', 'constraints', 'Include the explicit operating and film-coverage rules.');
    if (!Array.isArray(input.referenceShowings) || input.referenceShowings.length < 18 || input.referenceShowings.length > 600) error('SHOWING_SHAPE', 'referenceShowings', 'Provide a complete reference timetable of 18–600 showings, using every supported screen.');
    if (errors.length) return fail(errors, warnings);

    const filmMap = new Map(), siteMap = new Map();
    input.films.forEach((source, index) => {
      const path = 'films[' + index + ']';
      if (!object(source)) { error('FILM_OBJECT', path, 'Expected a film object.'); return; }
      fields(source, ['id', 'name', 'runtimeMinutes', 'base', 'dayFactor', 'primeFactor', 'minSeats', 'noLarge', 'largeRoomFactor'], path);
      const id = canonicalId(source.id, path + '.id');
      const film = {
        id, name: label(source.name, path + '.name', id ? 'Film ' + id : 'Film'),
        runtimeMinutes: number(source.runtimeMinutes, path + '.runtimeMinutes', {integer: true, positive: true, max: 2880}),
        base: number(source.base, path + '.base'),
        dayFactor: number(source.dayFactor, path + '.dayFactor'),
        primeFactor: number(source.primeFactor, path + '.primeFactor')
      };
      if (source.minSeats !== undefined) film.minSeats = number(source.minSeats, path + '.minSeats', {integer: true, positive: true});
      if (source.largeRoomFactor !== undefined) film.largeRoomFactor = number(source.largeRoomFactor, path + '.largeRoomFactor', {positive: true});
      if (source.noLarge !== undefined && typeof source.noLarge !== 'boolean') error('BOOLEAN', path + '.noLarge', 'Expected true or false.');
      film.noLarge = source.noLarge === true;
      if (id) {
        if (filmMap.has(id)) error('DUPLICATE_ID', path + '.id', 'Duplicate film ID ' + id + '.');
        else filmMap.set(id, film);
      }
    });
    input.sites.forEach((source, index) => {
      const path = 'sites[' + index + ']';
      if (!object(source)) { error('SITE_OBJECT', path, 'Expected a site object.'); return; }
      fields(source, ['id', 'name', 'screens', 'tastes'], path);
      const id = canonicalId(source.id, path + '.id');
      const site = {id, name: label(source.name, path + '.name', id ? 'Site ' + id : 'Site'), screens: [], tastes: keyedNumbers(source.tastes, path + '.tastes')};
      if (!Array.isArray(source.screens) || source.screens.length !== 3) error('SCREEN_SHAPE', path + '.screens', 'Each site must have exactly three screens.');
      else {
        const used = new Set();
        source.screens.forEach((screen, screenIndex) => {
          const screenPath = path + '.screens[' + screenIndex + ']';
          if (!object(screen)) { error('SCREEN_OBJECT', screenPath, 'Expected a screen object.'); return; }
          fields(screen, ['id', 'seats'], screenPath);
          const screenId = stableId(screen.id, screenPath + '.id');
          const seats = number(screen.seats, screenPath + '.seats', {integer: true, positive: true});
          if (screenId && used.has(screenId)) error('DUPLICATE_SCREEN_ID', screenPath + '.id', 'Duplicate screen ID ' + screenId + ' within site ' + id + '.');
          if (screenId) used.add(screenId);
          site.screens.push({id: screenId, seats});
        });
      }
      if (id) {
        if (siteMap.has(id)) error('DUPLICATE_ID', path + '.id', 'Duplicate site ID ' + id + '.');
        else siteMap.set(id, site);
      }
    });
    for (const id of IDS) {
      if (!filmMap.has(id)) error('MISSING_FILM', 'films', 'Missing film ' + id + '.');
      if (!siteMap.has(id)) error('MISSING_SITE', 'sites', 'Missing site ' + id + '.');
    }
    const rules = input.constraints;
    fields(rules, ['opening', 'closing', 'cleaningMinutes', 'startGridMinutes', 'minimumSites', 'maxShowsPerFilmSite', 'chainFilmCaps'], 'constraints');
    const constraints = {
      opening: number(rules.opening, 'constraints.opening', {integer: true, max: 2879}),
      closing: number(rules.closing, 'constraints.closing', {integer: true, positive: true, max: 2880}),
      cleaningMinutes: number(rules.cleaningMinutes, 'constraints.cleaningMinutes', {integer: true, max: 2880}),
      startGridMinutes: rules.startGridMinutes,
      minimumSites: number(rules.minimumSites, 'constraints.minimumSites', {integer: true, positive: true, max: 6}),
      maxShowsPerFilmSite: number(rules.maxShowsPerFilmSite, 'constraints.maxShowsPerFilmSite', {integer: true, positive: true, max: 600}),
      chainFilmCaps: keyedNumbers(rules.chainFilmCaps, 'constraints.chainFilmCaps', {integer: true, positive: true, max: 600})
    };
    if (rules.startGridMinutes !== 5) error('UNSUPPORTED_FIXED_RULE', 'constraints.startGridMinutes', 'The preserved packing engine supports only the five-minute start grid.');
    if (constraints.opening !== null && constraints.opening % 5 !== 0) error('OPENING_GRID', 'constraints.opening', 'Opening must fall on the five-minute grid.');
    if (constraints.opening !== null && constraints.closing !== null && constraints.closing <= constraints.opening) error('OPERATING_WINDOW', 'constraints.closing', 'Closing must be later than opening, expressed as minutes relative to the operating day.');
    const declared = input.model;
    fields(declared, ['referenceResponse', 'largeScreenThreshold', 'timeWeights', ...Object.keys(FIXED)], 'model');
    const model = {
      referenceResponse: number(declared.referenceResponse, 'model.referenceResponse', {positive: true}),
      largeScreenThreshold: number(declared.largeScreenThreshold, 'model.largeScreenThreshold', {integer: true, positive: true}),
      timeWeights: []
    };
    for (const [key, fixed] of Object.entries(FIXED)) {
      model[key] = fixed;
      if (declared[key] !== fixed) error('UNSUPPORTED_FIXED_RULE', 'model.' + key, 'The preserved response function requires ' + key + ' = ' + fixed + '. This coefficient is not configurable in this release.');
    }
    if (!Array.isArray(declared.timeWeights) || declared.timeWeights.length < 2 || declared.timeWeights.length > 96) error('TIME_WEIGHT_SHAPE', 'model.timeWeights', 'Provide 2–96 strictly increasing [minute, weight] points covering the operating window.');
    else {
      declared.timeWeights.forEach((point, index) => {
        const path = 'model.timeWeights[' + index + ']';
        if (!Array.isArray(point) || point.length !== 2) { error('TIME_WEIGHT_POINT', path, 'Expected [minute, weight].'); return; }
        const minute = number(point[0], path + '[0]', {integer: true, max: 2880});
        const weight = number(point[1], path + '[1]');
        if (minute !== null && model.timeWeights.length && minute <= model.timeWeights[model.timeWeights.length - 1][0]) error('TIME_WEIGHT_ORDER', path, 'Time-weight minutes must strictly increase; duplicate points are not allowed.');
        model.timeWeights.push([minute, weight]);
      });
      if (model.timeWeights.length && constraints.opening !== null && constraints.closing !== null) {
        if (model.timeWeights[0][0] > constraints.opening || model.timeWeights[model.timeWeights.length - 1][0] < constraints.closing) error('TIME_WEIGHT_COVERAGE', 'model.timeWeights', 'The first and last time-weight points must cover opening through closing.');
      }
    }
    if (errors.length) return fail(errors, warnings);

    const films = IDS.map(id => filmMap.get(id)), sites = IDS.map(id => siteMap.get(id));
    const seenShowings = new Set(), rows = [];
    input.referenceShowings.forEach((source, index) => {
      const path = 'referenceShowings[' + index + ']';
      if (!object(source)) { error('SHOWING_OBJECT', path, 'Expected a showing object.'); return; }
      fields(source, ['id', 'siteId', 'screenId', 'filmId', 'startMinute'], path);
      const id = stableId(source.id, path + '.id');
      const siteId = canonicalId(source.siteId, path + '.siteId');
      const filmId = canonicalId(source.filmId, path + '.filmId');
      const screenId = stableId(source.screenId, path + '.screenId');
      const startMinute = number(source.startMinute, path + '.startMinute', {integer: true, max: 2880});
      if (id && seenShowings.has(id)) error('DUPLICATE_SHOWING_ID', path + '.id', 'Duplicate showing ID ' + id + '.');
      if (id) seenShowings.add(id);
      if (startMinute !== null && startMinute % 5 !== 0) error('START_GRID', path + '.startMinute', 'Showing starts must fall on the five-minute grid.');
      const site = siteId && siteMap.get(siteId), film = filmId && filmMap.get(filmId);
      const screenIndex = site ? site.screens.findIndex(screen => screen.id === screenId) : -1;
      if (site && screenId && screenIndex < 0) error('UNKNOWN_SCREEN', path + '.screenId', 'Screen ' + screenId + ' does not exist at site ' + siteId + '. Use that site\'s declared screen ID.');
      if (!site || !film || screenIndex < 0 || startMinute === null) return;
      const end = startMinute + film.runtimeMinutes, seats = site.screens[screenIndex].seats;
      if (startMinute < constraints.opening) error('BEFORE_OPENING', path + '.startMinute', 'Showing ' + id + ' starts at ' + clock(startMinute) + ', before opening ' + clock(constraints.opening) + '.');
      if (end > constraints.closing) error('AFTER_CLOSING', path + '.startMinute', 'Showing ' + id + ' ends at ' + clock(end) + ', after closing ' + clock(constraints.closing) + '. Final-film cleaning is not part of this closing test.');
      if (film.minSeats !== undefined && seats < film.minSeats) error('MINIMUM_SEATS', path + '.filmId', 'Film ' + filmId + ' needs at least ' + film.minSeats + ' seats; site ' + siteId + ', screen ' + screenId + ' has ' + seats + '.');
      if (film.noLarge && seats >= model.largeScreenThreshold) error('LARGE_SCREEN_FORBIDDEN', path + '.filmId', 'Film ' + filmId + ' requires fewer than ' + model.largeScreenThreshold + ' seats; the selected screen has ' + seats + '.');
      rows.push({id, siteId, screenId, filmId, startMinute, sourceIndex: index, siteIndex: IDS.indexOf(siteId), screenIndex, filmIndex: IDS.indexOf(filmId)});
    });
    if (errors.length) return fail(errors, warnings);
    rows.sort((a, b) => a.siteIndex - b.siteIndex || a.screenIndex - b.screenIndex || a.startMinute - b.startMinute || a.id.localeCompare(b.id));
    const plan = sites.map(() => ({off: [0, 0, 0], seq: [[], [], []]}));
    const chain = IDS.map(() => 0), coverage = IDS.map(() => new Set()), siteCounts = sites.map(() => IDS.map(() => 0));
    const showingMetadata = [];
    sites.forEach((site, siteIndex) => {
      site.screens.forEach((screen, screenIndex) => {
        const lane = rows.filter(row => row.siteIndex === siteIndex && row.screenIndex === screenIndex);
        if (!lane.length) { error('UNUSED_SCREEN', 'referenceShowings', 'The complete timetable must include at least one showing on site ' + site.id + ', screen ' + screen.id + '.'); return; }
        plan[siteIndex].off[screenIndex] = lane[0].startMinute - constraints.opening;
        lane.forEach((row, position) => {
          const film = films[row.filmIndex], previous = lane[position - 1];
          const gap = previous ? row.startMinute - previous.startMinute - films[previous.filmIndex].runtimeMinutes - constraints.cleaningMinutes : 0;
          if (gap < 0) error('OVERLAP_OR_CLEANING', 'referenceShowings[' + row.sourceIndex + '].startMinute', 'Showing ' + row.id + ' starts at ' + clock(row.startMinute) + ', before previous showing ' + previous.id + ' plus ' + constraints.cleaningMinutes + '-minute cleaning ends at ' + clock(previous.startMinute + films[previous.filmIndex].runtimeMinutes + constraints.cleaningMinutes) + '.');
          plan[siteIndex].seq[screenIndex].push({f: row.filmIndex, gap});
          chain[row.filmIndex]++; coverage[row.filmIndex].add(siteIndex); siteCounts[siteIndex][row.filmIndex]++;
          showingMetadata.push({id: row.id, siteId: row.siteId, screenId: row.screenId, filmId: row.filmId, siteIndex, screenIndex, filmIndex: row.filmIndex, position: position + 1, startMinute: row.startMinute, endMinute: row.startMinute + film.runtimeMinutes});
        });
      });
    });
    IDS.forEach((id, filmIndex) => {
      if (chain[filmIndex] > constraints.chainFilmCaps[id]) error('CHAIN_FILM_CAP', 'referenceShowings', 'Film ' + id + ' has ' + chain[filmIndex] + ' showings, exceeding its chain cap ' + constraints.chainFilmCaps[id] + '.');
      if (coverage[filmIndex].size < constraints.minimumSites) error('FILM_SITE_COVERAGE', 'referenceShowings', 'Film ' + id + ' appears at ' + coverage[filmIndex].size + ' sites; at least ' + constraints.minimumSites + ' are required.');
      sites.forEach((site, siteIndex) => {
        if (siteCounts[siteIndex][filmIndex] > constraints.maxShowsPerFilmSite) error('SITE_FILM_CAP', 'referenceShowings', 'Film ' + id + ' has ' + siteCounts[siteIndex][filmIndex] + ' showings at site ' + site.id + ', exceeding the per-site cap ' + constraints.maxShowsPerFilmSite + '.');
      });
    });
    if (errors.length) return fail(errors, warnings);
    const normalized = {
      schemaVersion: SCHEMA, title, films, sites, model, constraints,
      referenceShowings: showingMetadata.map(({id, siteId, screenId, filmId, startMinute}) => ({id, siteId, screenId, filmId, startMinute}))
    };
    const engine = {
      sites: sites.map(site => ({id: site.id, name: site.name, halls: site.screens.map(screen => screen.seats), taste: IDS.map(id => site.tastes[id])})),
      films: films.map(film => Object.assign({k: film.id, name: film.name, rt: film.runtimeMinutes, base: film.base, day: film.dayFactor, prime: film.primeFactor, cls: 'f' + film.id}, film.minSeats === undefined ? {} : {minCap: film.minSeats}, film.largeRoomFactor === undefined ? {} : {largeUp: film.largeRoomFactor}, film.noLarge ? {noLarge: true} : {})),
      plan, opening: constraints.opening, closing: constraints.closing,
      cleaningMinutes: constraints.cleaningMinutes, referenceResponse: model.referenceResponse,
      timeWeights: model.timeWeights.map(point => point.slice()), largeScreenThreshold: model.largeScreenThreshold,
      chainFilmCaps: IDS.map(id => constraints.chainFilmCaps[id]), minimumSites: constraints.minimumSites,
      maxShowsPerFilmSite: constraints.maxShowsPerFilmSite
    };
    return {
      ok: true, package: copy(normalized), engine: copy(engine),
      summary: {schemaVersion: SCHEMA, title, filmCount: 6, siteCount: 6, screenCount: 18, showingCount: rows.length, opening: constraints.opening, closing: constraints.closing, cleaningMinutes: constraints.cleaningMinutes, countsByFilm: Object.fromEntries(IDS.map((id, index) => [id, chain[index]])), sitesPerFilm: Object.fromEntries(IDS.map((id, index) => [id, coverage[index].size]))},
      showingMetadata: copy(showingMetadata), originalShowingIds: showingMetadata.map(row => row.id), errors: [], warnings
    };
  }
  function parseJSON(text) {
    const issue = checkText(text, 'JSON');
    if (issue) return fail([issue]);
    let data;
    try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch (exception) { return fail([inputError('JSON_SYNTAX', 'JSON', 'The JSON cannot be parsed: ' + exception.message)]); }
    return validate(data);
  }
  function csvRows(text) {
    const rows = []; let row = [], field = '', quoted = false, afterQuote = false, line = 1, rowLine = 1;
    function emitField() { row.push(field); field = ''; afterQuote = false; }
    function emitRow() { emitField(); if (row.some(value => value.trim())) rows.push({cells: row, line: rowLine}); row = []; rowLine = line; }
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (quoted) {
        if (char === '"') { if (text[index + 1] === '"') { field += '"'; index++; } else { quoted = false; afterQuote = true; } }
        else { field += char; if (char === '\n') line++; }
        continue;
      }
      if (char === ',') { emitField(); continue; }
      if (char === '\r' || char === '\n') { if (char === '\r' && text[index + 1] === '\n') index++; line++; emitRow(); continue; }
      if (afterQuote) { if (char === ' ' || char === '\t') continue; return {error: inputError('CSV_QUOTE_TRAILING', 'CSV', 'Unexpected text after a closing CSV quote.', line)}; }
      if (char === '"') { if (field.trim()) return {error: inputError('CSV_QUOTE_POSITION', 'CSV', 'A quote must begin a CSV field; escape an embedded quote as "".', line)}; field = ''; quoted = true; }
      else field += char;
    }
    if (quoted) return {error: inputError('CSV_UNCLOSED_QUOTE', 'CSV', 'The CSV ends inside a quoted field.', rowLine)};
    if (field.length || row.length || afterQuote) emitRow();
    return {rows};
  }
  function parseCSV(text, defaultPackage) {
    const issue = checkText(text, 'CSV');
    if (issue) return fail([issue]);
    if (!object(defaultPackage)) return fail([inputError('CSV_FIXTURE_REQUIRED', 'defaultPackage', 'CSV import requires the current loaded planning package or the classroom default package. CSV does not contain film, site or response-model assumptions.')]);
    const parsed = csvRows(text.replace(/^\uFEFF/, ''));
    if (parsed.error) return fail([parsed.error]);
    if (!parsed.rows.length) return fail([inputError('CSV_EMPTY', 'CSV', 'The CSV has no header or screening rows.')]);
    const header = parsed.rows[0].cells.map(cell => cell.trim().toLowerCase());
    const required = ['showing_id', 'site_id', 'screen_id', 'film_id', 'start_time'];
    const errors = [];
    if (new Set(header).size !== header.length) errors.push(inputError('CSV_DUPLICATE_HEADER', 'CSV.header', 'CSV headers must be unique.', parsed.rows[0].line));
    for (const key of required) if (!header.includes(key)) errors.push(inputError('CSV_MISSING_HEADER', 'CSV.header', 'Missing required column ' + key + '.', parsed.rows[0].line));
    for (const key of header) if (!required.includes(key)) errors.push(inputError('CSV_UNKNOWN_HEADER', 'CSV.header', 'Unsupported column ' + key + '. Use only showing_id,site_id,screen_id,film_id,start_time.', parsed.rows[0].line));
    if (errors.length) return fail(errors);
    const showings = [], lineMap = [];
    parsed.rows.slice(1).forEach(entry => {
      if (entry.cells.length !== header.length) { errors.push(inputError('CSV_COLUMN_COUNT', 'CSV', 'Expected ' + header.length + ' fields but found ' + entry.cells.length + '.', entry.line)); return; }
      const row = Object.fromEntries(header.map((key, index) => [key, entry.cells[index].trim()]));
      const match = /^(\d{1,2}):([0-5]\d)$/.exec(row.start_time);
      const minute = match ? Number(match[1]) * 60 + Number(match[2]) : null;
      if (minute === null || minute > 2880) { errors.push(inputError('CSV_TIME', 'CSV.start_time', 'Use HH:mm relative to the operating day, for example 10:00 or 24:35; the supported range ends at 48:00.', entry.line)); return; }
      showings.push({id: row.showing_id, siteId: row.site_id, screenId: row.screen_id, filmId: row.film_id, startMinute: minute});
      lineMap.push(entry.line);
    });
    if (errors.length) return fail(errors.slice(0, 100));
    const result = validate(Object.assign({}, defaultPackage, {referenceShowings: showings}));
    result.errors = result.errors.map(issue => {
      const match = /^referenceShowings\[(\d+)\]/.exec(issue.path);
      return match ? Object.assign({}, issue, {row: lineMap[Number(match[1])]}) : issue;
    });
    return result;
  }
  function templateJSON(planningPackage) {
    const result = validate(planningPackage);
    if (!result.ok) return {ok: false, text: null, errors: result.errors, warnings: result.warnings};
    return {ok: true, text: JSON.stringify(result.package, null, 2) + '\n', errors: [], warnings: result.warnings};
  }
  function templateCSV(planningPackage) {
    const result = validate(planningPackage);
    if (!result.ok) return {ok: false, text: null, errors: result.errors, warnings: result.warnings};
    const quote = value => '"' + String(value).replace(/"/g, '""') + '"';
    const lines = ['showing_id,site_id,screen_id,film_id,start_time'];
    result.package.referenceShowings.forEach(showing => lines.push([showing.id, showing.siteId, showing.screenId, showing.filmId, clock(showing.startMinute)].map(quote).join(',')));
    return {ok: true, text: lines.join('\r\n') + '\r\n', errors: [], warnings: result.warnings};
  }
  return Object.freeze({schemaVersion: SCHEMA, maxInputBytes: LIMIT, createError: inputError, validate, parseJSON, parseCSV, templateJSON, templateCSV});
}

// The identical pure factory can be embedded in a standalone browser page.
export const datasetEngine = 'var ResponseDataset = (' + createDatasetTools.toString() + ')();';
export const datasetEngineString = datasetEngine;
