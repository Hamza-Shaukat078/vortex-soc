export default function SearchFilter({ query, setQuery, verdict, setVerdict, inputRef }) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search emails… (press /)"
          className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 border border-white/5 focus:outline-none focus:border-white/10 transition-all font-medium"
          style={{ background: 'rgba(10,14,20,0.8)' }}
        />
      </div>
      <select
        value={verdict}
        onChange={e => setVerdict(e.target.value)}
        className="px-3 py-2.5 rounded-xl text-sm text-gray-400 border border-white/5 focus:outline-none focus:border-white/10 transition-all"
        style={{ background: 'rgba(10,14,20,0.8)' }}
      >
        <option value="">All</option>
        <option value="phishing">Phishing</option>
        <option value="suspicious">Suspicious</option>
        <option value="legitimate">Legitimate</option>
      </select>
    </div>
  )
}
