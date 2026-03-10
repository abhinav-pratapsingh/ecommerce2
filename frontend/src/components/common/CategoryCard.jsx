import { Link } from 'react-router-dom'

const CATEGORY_ICONS = {
  electronics:    'EL',
  clothing:       'CL',
  fashion:        'FA',
  books:          'BK',
  'home & kitchen': 'HK',
  sports:         'SP',
  beauty:         'BE',
  toys:           'TO',
  jewelry:        'JW',
  watches:        'WA',
  furniture:      'FU',
  gaming:         'GA',
  automotive:     'AU',
  health:         'HE',
  bags:           'BA',
  default:        'SHOP',
}

const CATEGORY_GRADIENTS = [
  'from-blue-500/20 to-cyan-500/5',
  'from-indigo-500/20 to-purple-500/5',
  'from-sky-500/20 to-blue-500/5',
  'from-violet-500/20 to-indigo-500/5',
  'from-cyan-500/20 to-teal-500/5',
  'from-blue-600/20 to-indigo-500/5',
]

const CategoryCard = ({ category, index = 0 }) => {
  const icon = CATEGORY_ICONS[category.name?.toLowerCase()] || CATEGORY_ICONS.default
  const grad = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]

  return (
    <Link
      to={`/products?category=${category._id}`}
      className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${grad} border border-surface-border hover:border-brand-500/50 transition-all duration-300 hover:shadow-glow-sm cursor-pointer`}
    >
      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <span className="font-display font-semibold text-sm text-ink text-center leading-tight">{category.name}</span>
    </Link>
  )
}

export default CategoryCard


