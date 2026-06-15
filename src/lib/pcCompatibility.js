import { normalizeSystemRequirements } from '@/lib/systemRequirements'

function cpuRank(value) {
	const text = String(value || '').toLowerCase()
	if (!text) return null
	const intel = text.match(/i([3579])[-\s]?(\d{3,5})?/)
	if (intel) {
		const series = Number(intel[1])
		const model = intel[2] ? Number(intel[2]) : 0
		const generation = model >= 10000 ? Math.floor(model / 1000) : model >= 1000 ? Math.floor(model / 100) : 0
		return series * 120 + generation * 18
	}
	const ryzen = text.match(/ryzen\s*([3579])\s*(\d{3,5})?/)
	if (ryzen) {
		const series = Number(ryzen[1])
		const model = ryzen[2] ? Number(ryzen[2]) : 0
		const generation = model >= 1000 ? Math.floor(model / 1000) : 0
		return series * 125 + generation * 22
	}
	if (text.includes('core 2') || text.includes('athlon')) return 120
	if (text.includes('pentium') || text.includes('celeron')) return 90
	return null
}

function gpuRank(value) {
	const text = String(value || '').toLowerCase()
	if (!text) return null
	if (text.includes('rtx')) {
		const model = Number(text.match(/rtx\s*(\d{3,4})/)?.[1] || 0)
		if (model >= 4000) return 1000 + (model % 1000) / 10
		if (model >= 3000) return 850 + (model % 1000) / 10
		if (model >= 2000) return 700 + (model % 1000) / 10
		return 680
	}
	if (text.includes('gtx')) {
		const model = Number(text.match(/gtx\s*(\d{3,4})/)?.[1] || 0)
		if (model >= 1600) return 650 + (model % 100) / 10
		if (model >= 1000) return 520 + (model % 1000) / 10
		if (model >= 900) return 430 + (model % 100) / 10
		if (model >= 600) return 280 + (model % 100) / 10
		return 220
	}
	if (text.includes('gts')) return 180
	if (text.includes('radeon') || text.includes('rx')) {
		const model = Number(text.match(/(?:rx|radeon)\s*(\d{3,4})/)?.[1] || 0)
		if (model >= 7000) return 950 + (model % 1000) / 10
		if (model >= 6000) return 820 + (model % 1000) / 10
		if (model >= 5000) return 650 + (model % 1000) / 10
		if (model >= 500) return 360 + (model % 100) / 10
		return 250
	}
	if (text.includes('iris') || text.includes('vega')) return 230
	if (text.includes('intel') || text.includes('integrated')) return 120
	return null
}

function osRank(value) {
	const text = String(value || '').toLowerCase()
	if (!text) return null
	if (text.includes('windows 11')) return { family: 'windows', rank: 11 }
	if (text.includes('windows 10')) return { family: 'windows', rank: 10 }
	if (text.includes('windows 8')) return { family: 'windows', rank: 8 }
	if (text.includes('windows 7')) return { family: 'windows', rank: 7 }
	if (text.includes('mac') || text.includes('macos')) return { family: 'macos', rank: 10 }
	if (text.includes('linux') || text.includes('ubuntu')) return { family: 'linux', rank: 10 }
	return null
}

function compareNumber(userValue, requiredValue, label, reasons, missingData) {
	if (requiredValue == null) {
		missingData.push(label)
		return true
	}
	if (userValue == null || userValue === '') {
		missingData.push(`Ваш ${label}`)
		return false
	}
	if (Number(userValue) >= Number(requiredValue)) {
		reasons.push(`Достаточно: ${label}`)
		return true
	}
	reasons.push(`Недостаточно: ${label}`)
	return false
}

function compareRank(userText, requiredText, label, ranker, reasons, missingData) {
	if (!requiredText) {
		missingData.push(label)
		return true
	}
	const requiredRank = ranker(requiredText)
	const userRank = ranker(userText)
	if (requiredRank == null) {
		missingData.push(label)
		return true
	}
	if (userRank == null) {
		missingData.push(`Ваш ${label}`)
		return false
	}
	if (userRank >= requiredRank) {
		reasons.push(`${label}: подходит`)
		return true
	}
	reasons.push(`${label}: слабее требования`)
	return false
}

function compareOs(userOs, requiredOs, reasons, missingData) {
	if (!requiredOs) {
		missingData.push('OS')
		return true
	}
	const req = osRank(requiredOs)
	const user = osRank(userOs)
	if (!req) {
		missingData.push('OS')
		return true
	}
	if (!user) {
		missingData.push('Ваша OS')
		return false
	}
	if (user.family === req.family && user.rank >= req.rank) {
		reasons.push('Операционная система подходит')
		return true
	}
	reasons.push('Операционная система не подходит')
	return false
}

function compareSection(userPc, section) {
	const reasons = []
	const missingData = []
	const checks = [
		compareOs(userPc.os, section.os, reasons, missingData),
		compareRank(userPc.cpu, section.cpu, 'CPU', cpuRank, reasons, missingData),
		compareRank(userPc.gpu, section.gpu, 'GPU', gpuRank, reasons, missingData),
		compareNumber(userPc.ramGb, section.ramGb, 'RAM', reasons, missingData),
		compareNumber(userPc.storageGb, section.storageGb, 'место на диске', reasons, missingData),
	]
	if (section.directx != null) {
		checks.push(compareNumber(userPc.directx, section.directx, 'DirectX', reasons, missingData))
	}
	const knownChecks = checks.length - missingData.filter((item) => !item.startsWith('Ваш')).length
	const passed = checks.filter(Boolean).length
	return {
		pass: checks.every(Boolean),
		score: checks.length ? Math.round((passed / checks.length) * 100) : 0,
		reasons,
		missingData,
		hasEnoughData: knownChecks >= 3,
	}
}

const preferenceStopWords = new Set([
	'and',
	'the',
	'with',
	'game',
	'games',
	'игра',
	'игры',
	'хочу',
	'нужна',
	'нужен',
	'чтобы',
	'для',
	'про',
	'как',
	'без',
	'или',
	'это',
])

function normalizePreferenceText(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/ё/g, 'е')
}

function tokenizePreference(value) {
	return [...new Set(
		(normalizePreferenceText(value).match(/[a-zа-я0-9]{3,}/g) || [])
			.filter((word) => !preferenceStopWords.has(word))
	)]
}

function fieldToText(value) {
	if (!value) return ''
	if (Array.isArray(value)) return value.map(fieldToText).join(' ')
	if (typeof value === 'object') {
		return [
			value.title,
			value.name,
			value.slug,
			value.description,
			value.shortDescription,
		]
			.filter(Boolean)
			.join(' ')
	}
	return String(value)
}

export function scoreGamePreference(game, wish) {
	const tokens = tokenizePreference(wish)
	if (!tokens.length) {
		return { score: 0, reasons: [], missingData: [] }
	}
	const searchable = normalizePreferenceText([
		game.name,
		game.title,
		game.description,
		game.shortDescription,
		game.small_description,
		fieldToText(game.genres),
		fieldToText(game.tags),
		fieldToText(game.platforms),
		game.developer,
		game.publisher,
		game.series,
		game.itemType,
	].join(' '))
	const matched = tokens.filter((token) => searchable.includes(token))
	const score = Math.min(100, Math.round((matched.length / tokens.length) * 100))
	return {
		score,
		reasons: matched.length
			? [`Пожелания: совпало ${matched.slice(0, 5).join(', ')}`]
			: ['Пожелания: точных совпадений не найдено'],
		missingData: matched.length ? [] : ['пожелания'],
	}
}

export function checkGameCompatibility(game, userPc) {
	const requirements = normalizeSystemRequirements(game.systemRequirements)
	const minimum = compareSection(userPc, requirements.minimum)
	const recommended = compareSection(userPc, requirements.recommended)
	const hasRecommendedData = requirements.recommended.rawText || requirements.recommended.cpu || requirements.recommended.gpu || requirements.recommended.ramGb

	if (!minimum.hasEnoughData && !hasRecommendedData) {
		return {
			game,
			status: 'unknown',
			score: 0,
			reasons: ['Недостаточно данных по системным требованиям игры'],
			missingData: [...new Set(minimum.missingData)],
		}
	}

	if (hasRecommendedData && recommended.pass) {
		return {
			game,
			status: 'recommended',
			score: Math.max(85, recommended.score),
			reasons: recommended.reasons,
			missingData: [...new Set(recommended.missingData)],
		}
	}

	if (minimum.pass) {
		return {
			game,
			status: 'minimum',
			score: Math.max(60, minimum.score),
			reasons: minimum.reasons.concat(hasRecommendedData ? ['До рекомендованных требований есть запас не по всем параметрам'] : []),
			missingData: [...new Set(minimum.missingData.concat(recommended.missingData))],
		}
	}

	return {
		game,
		status: 'not_supported',
		score: Math.min(45, minimum.score),
		reasons: minimum.reasons,
		missingData: [...new Set(minimum.missingData)],
	}
}

export function checkGameCompatibilityWithPreferences(game, userPc, wish) {
	const compatibility = checkGameCompatibility(game, userPc)
	const preference = scoreGamePreference(game, wish)
	if (!tokenizePreference(wish).length) return compatibility
	const score =
		compatibility.status === 'unknown'
			? Math.max(compatibility.score, preference.score)
			: Math.round(compatibility.score * 0.72 + preference.score * 0.28)
	return {
		...compatibility,
		score,
		reasons: preference.reasons.concat(compatibility.reasons),
		missingData: [...new Set(compatibility.missingData.concat(preference.missingData))],
		preferenceScore: preference.score,
	}
}

export function groupCompatibilityResults(results) {
	return {
		recommended: results.filter((item) => item.status === 'recommended'),
		minimum: results.filter((item) => item.status === 'minimum'),
		not_supported: results.filter((item) => item.status === 'not_supported'),
		unknown: results.filter((item) => item.status === 'unknown'),
	}
}
