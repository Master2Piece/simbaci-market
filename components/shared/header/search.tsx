import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllCategories } from '@/lib/actions/categories-action'
import { SearchIcon } from 'lucide-react'

export default async function Search() {
  const { category_name: categories } = await getAllCategories()

  return (
    <form action="/search" method="GET">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Select name="category">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={'All'} value={'Semua'}>
              Semua
            </SelectItem>
            {categories.map((category: { name: string; id: string }) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          name="q"
          type="text"
          placeholder="Cari..."
          className="md:w-[100px] lg:w-[300px]"
        />
        <Button>
          <SearchIcon />
        </Button>
      </div>
    </form>
  )
}
