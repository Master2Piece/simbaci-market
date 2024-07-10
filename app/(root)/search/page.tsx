import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import { getAllCategories } from '@/lib/actions/categories-action'
import { getAllProducts } from '@/lib/actions/product-actions'
import { APP_NAME } from '@/lib/constants'
import Link from 'next/link'

const sortOrders = ['Terbaru', 'Termurah', 'Termahal']

export async function generateMetadata({
  searchParams: { q = 'all', category = 'all', price = 'all', rating = 'all' },
}: {
  searchParams: {
    q: string
    category: string
    price: string
    rating: string
    sort: string
    page: string
  }
}) {
  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    rating !== 'all' ||
    price !== 'all'
  ) {
    return {
      title: `Search ${q !== 'all' ? q : ''} ${
        category !== 'all' ? ` : Category ${category}` : ''
      } ${price !== 'all' ? ` : Price ${price}` : ''} - ${APP_NAME}`,
    }
  } else {
    return {
      title: `Search Products - ${APP_NAME}`,
    }
  }
}

export default async function SearchPage({
  searchParams: {
    q = 'all',
    category = 'all',
    price = 'all',
    sort = 'Terbaru',
    page = '1',
  },
}: {
  searchParams: {
    q: string
    category: string
    price: string
    rating: string
    sort: string
    page: string
  }
}) {
  const getFilterUrl = ({
    c,
    s,
    p,
    pg,
  }: {
    c?: string
    s?: string
    p?: string
    pg?: string
  }) => {
    const params = { q, category, price, sort, page }
    if (c) params.category = c
    if (p) params.price = p
    if (pg) params.page = pg
    if (s) params.sort = s
    return `/search?${new URLSearchParams(params).toString()}`
  }

  const { category_name: categories } = await getAllCategories()
  const categoryUUID =
    categories.find((c: { id: string }) => c.id === category)?.id || 'all'
  const products = await getAllProducts({
    category: categoryUUID,
    query: q,
    price,
    page: Number(page),
    sort,
  })

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div>
        <div className="text-xl pt-3">Kategori</div>
        <div>
          <ul>
            <li>
              <Link
                className={`${
                  ('all' === category || '' === category) && 'text-primary'
                }`}
                href={getFilterUrl({ c: 'all' })}
              >
                Any
              </Link>
            </li>
            {categories.map((c: { name: string; id: string }) => (
              <li key={c.id}>
                <Link
                  className={`${c.id === category && 'text-primary'}`}
                  href={getFilterUrl({ c: c.id })}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            {q !== 'all' && q !== '' && 'Query : ' + q}
            {category !== 'all' &&
              category !== '' &&
              ' Kategori : ' +
                categories.find((c: { id: string }) => c.id === category)?.name}
            {price !== 'all' && ' Price: ' + price}
            &nbsp;
            {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            price !== 'all' ? (
              <Button variant={'link'} asChild>
                <Link href="/search">Reset</Link>
              </Button>
            ) : null}
          </div>
          <div>
            Diurutkan{' '}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`mx-2 ${sort === s && 'text-primary'}`}
                href={getFilterUrl({ s })}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && <div>Produk tidak ditemukan</div>}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.totalPages > 1 && (
          <Pagination page={page} totalPages={products.totalPages} />
        )}
      </div>
    </div>
  )
}
