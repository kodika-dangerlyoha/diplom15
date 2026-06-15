const ALLOWED_TAGS = new Set([
	'A',
	'B',
	'BR',
	'BLOCKQUOTE',
	'DIV',
	'EM',
	'H1',
	'H2',
	'H3',
	'H4',
	'HR',
	'I',
	'IMG',
	'LI',
	'OL',
	'P',
	'SPAN',
	'STRONG',
	'TABLE',
	'TBODY',
	'TD',
	'TH',
	'THEAD',
	'TR',
	'U',
	'UL',
])

const ALLOWED_ATTRS = {
	A: ['href', 'target', 'rel'],
	IMG: ['src', 'alt', 'loading'],
	DIV: ['class'],
	SPAN: ['class'],
	UL: ['class'],
	OL: ['class'],
	P: ['class'],
	LI: ['class'],
	TABLE: ['class'],
	TBODY: ['class'],
	THEAD: ['class'],
	TR: ['class'],
	TD: ['class'],
	TH: ['class'],
}

function isSafeUrl(value) {
	const url = String(value || '').trim()
	if (!url) return false
	if (url.startsWith('/') && !url.startsWith('//')) return true
	return /^https?:\/\//i.test(url)
}

function escapeHtml(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function looksLikeHtml(value) {
	return /<\/?[a-z][\s\S]*>/i.test(String(value || ''))
}

function escapeAttr(value) {
	return escapeHtml(value).replace(/'/g, '&#39;')
}

function attrsFromString(value) {
	const attrs = {}
	String(value || '').replace(/([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g, (_, name, rawValue = '') => {
		const key = String(name || '').toLowerCase()
		let attrValue = String(rawValue || '').trim()
		if ((attrValue.startsWith('"') && attrValue.endsWith('"')) || (attrValue.startsWith("'") && attrValue.endsWith("'"))) {
			attrValue = attrValue.slice(1, -1)
		}
		attrs[key] = attrValue
		return ''
	})
	return attrs
}

function sanitizedAttrs(tagName, attrString) {
	const tag = tagName.toUpperCase()
	const allowed = ALLOWED_ATTRS[tag] || []
	const attrs = attrsFromString(attrString)
	const result = []
	for (const name of allowed) {
		const value = attrs[name]
		if (value == null || value === '' || value.toLowerCase().includes('javascript:')) continue
		if ((name === 'href' || name === 'src') && !isSafeUrl(value)) continue
		result.push(`${name}="${escapeAttr(value)}"`)
	}
	if (tag === 'A' && attrs.href && isSafeUrl(attrs.href)) {
		if (!result.some((attr) => attr.startsWith('target='))) result.push('target="_blank"')
		if (!result.some((attr) => attr.startsWith('rel='))) result.push('rel="noreferrer"')
	}
	if (tag === 'IMG') {
		if (!attrs.src || !isSafeUrl(attrs.src)) return null
		if (!result.some((attr) => attr.startsWith('loading='))) result.push('loading="lazy"')
		if (!result.some((attr) => attr.startsWith('alt='))) result.push('alt=""')
	}
	return result.length ? ` ${result.join(' ')}` : ''
}

export function sanitizeHtml(value) {
	const html = String(value || '')
	if (!html) return ''
	return html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<\/?([a-z][a-z0-9]*)([^>]*)>/gi, (match, tagName, attrString) => {
			const tag = String(tagName || '').toUpperCase()
			if (!ALLOWED_TAGS.has(tag)) return ''
			if (match.startsWith('</')) return `</${tag.toLowerCase()}>`
			const attrs = sanitizedAttrs(tag, attrString)
			if (attrs === null) return ''
			const closing = /\/\s*>$/.test(match) || tag === 'BR' || tag === 'HR' || tag === 'IMG'
			return `<${tag.toLowerCase()}${attrs}${closing ? ' />' : '>'}`
		})
}

function listFromObject(obj) {
	return Object.entries(obj || {})
		.filter(([, value]) => value != null && value !== '')
		.map(([key, value]) => {
			if (Array.isArray(value)) return `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value.join(', '))}</li>`
			if (typeof value === 'object') return `<li><strong>${escapeHtml(key)}:</strong> ${listFromObject(value)}</li>`
			return `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`
		})
		.join('')
}

function sectionHtml(title, value) {
	if (!value) return ''
	if (typeof value === 'string') {
		const body = looksLikeHtml(value) ? sanitizeHtml(value) : `<ul class="bb_ul"><li>${escapeHtml(value)}</li></ul>`
		return `<ul><strong>${escapeHtml(title)}:</strong><br>${body}</ul>`
	}
	if (typeof value === 'object') {
		return `<ul><strong>${escapeHtml(title)}:</strong><br><ul class="bb_ul">${listFromObject(value)}</ul></ul>`
	}
	return ''
}

export function systemRequirementsToHtml(value) {
	if (!value) return ''
	if (typeof value === 'string') return looksLikeHtml(value) ? sanitizeHtml(value) : sectionHtml('Минимальные', value)
	if (Array.isArray(value)) return value.map((item) => sectionHtml(item.title || 'Требования', item.html || item.value || item)).join('')
	if (typeof value === 'object') {
		if (value.html || value.pc_requirements) return sanitizeHtml(value.html || value.pc_requirements)
		const minimum = value.minimum || value.min || value.minimumRequirements
		const recommended = value.recommended || value.rec || value.recommendedRequirements
		const sections = [sectionHtml('Минимальные', minimum), sectionHtml('Рекомендованные', recommended)].join('')
		if (sections) return sections
		return `<ul class="bb_ul">${listFromObject(value)}</ul>`
	}
	return ''
}

function stripHtml(value) {
	return String(value || '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/li>/gi, '\n')
		.replace(/<\/p>/gi, '\n')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim()
}

function textValue(value) {
	if (!value) return ''
	if (Array.isArray(value)) return value.join(', ')
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([key, item]) => `${key}: ${textValue(item)}`)
			.join(', ')
	}
	return String(value)
}

function findValue(text, labels) {
	for (const label of labels) {
		const re = new RegExp(`${label}\\s*:?\\s*([^;\\n\\r]+?)(?=\\s+(?:ОС|OS|Процессор|CPU|Оперативная|Memory|RAM|Видеокарта|Graphics|GPU|DirectX|Место|Storage|Сеть|Network)\\s*:|$)`, 'i')
		const match = text.match(re)
		if (match?.[1]) return match[1].trim()
	}
	return ''
}

function findGb(text, labels) {
	const value = findValue(text, labels) || text
	const match = value.match(/(\d+(?:[.,]\d+)?)\s*(?:gb|гб|озу|ram|space|storage|диск)/i)
	if (!match) return null
	return Number(String(match[1]).replace(',', '.'))
}

function findDirectX(text) {
	const match = String(text || '').match(/directx\s*:?\s*(?:версии|version)?\s*(\d+)/i)
	return match ? Number(match[1]) : null
}

function normalizeSection(value) {
	const rawText = stripHtml(textValue(value))
	return {
		os: findValue(rawText, ['ОС', 'OS']) || '',
		cpu: findValue(rawText, ['Процессор', 'CPU', 'Processor']) || '',
		ramGb: findGb(rawText, ['Оперативная память', 'Memory', 'RAM']),
		gpu: findValue(rawText, ['Видеокарта', 'Graphics', 'GPU', 'Video']) || '',
		directx: findDirectX(rawText),
		storageGb: findGb(findValue(rawText, ['Место на диске', 'Storage', 'Hard Drive', 'Disk Space']), ['Место на диске', 'Storage', 'Hard Drive', 'Disk Space']),
		rawText,
	}
}

function splitHtmlSections(value) {
	const html = String(value || '')
	const minIndex = html.search(/Минимальн|Minimum/i)
	const recIndex = html.search(/Рекоменд|Recommended/i)
	if (minIndex === -1 && recIndex === -1) return { minimum: html, recommended: '' }
	if (minIndex !== -1 && recIndex !== -1) {
		if (minIndex < recIndex) return { minimum: html.slice(minIndex, recIndex), recommended: html.slice(recIndex) }
		return { minimum: html.slice(minIndex), recommended: html.slice(recIndex, minIndex) }
	}
	if (minIndex !== -1) return { minimum: html.slice(minIndex), recommended: '' }
	return { minimum: '', recommended: html.slice(recIndex) }
}

export function normalizeSystemRequirements(value) {
	if (!value) {
		return {
			minimum: normalizeSection(''),
			recommended: normalizeSection(''),
			rawHtml: '',
			rawText: '',
		}
	}

	if (typeof value === 'string') {
		const sections = looksLikeHtml(value) ? splitHtmlSections(value) : { minimum: value, recommended: '' }
		return {
			minimum: normalizeSection(sections.minimum),
			recommended: normalizeSection(sections.recommended),
			rawHtml: looksLikeHtml(value) ? sanitizeHtml(value) : '',
			rawText: stripHtml(value),
		}
	}

	if (typeof value === 'object') {
		const rawHtml = value.html || value.pc_requirements || ''
		if (rawHtml) return normalizeSystemRequirements(rawHtml)
		const minimum = value.minimum || value.min || value.minimumRequirements || value
		const recommended = value.recommended || value.rec || value.recommendedRequirements || ''
		return {
			minimum: normalizeSection(minimum),
			recommended: normalizeSection(recommended),
			rawHtml: '',
			rawText: stripHtml(textValue(value)),
		}
	}

	return normalizeSystemRequirements(String(value))
}
