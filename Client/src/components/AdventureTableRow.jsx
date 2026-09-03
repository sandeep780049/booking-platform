import { TableRow, TableCell } from "./ui/table"
import { Button } from "./ui/button"
import { Edit2, Trash2 } from "lucide-react"

const AdventureTableRow = ({ adventure, onEdit, onDelete }) => (
  <TableRow className="group hover:bg-gray-50/80 transition-all duration-200">
    <TableCell className="font-medium text-gray-900">{adventure.name}</TableCell>
    <TableCell className="text-gray-600">
      {Array.isArray(adventure.location) && adventure.location.length > 0
        ? adventure.location.map(loc => loc.name).join(", ")
        : <span className="text-gray-400 italic">No location</span>}
    </TableCell>
    <TableCell>
      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full bg-gray-100 text-gray-900 text-sm font-medium">
        {adventure.bookings?.length || 0}
      </span>
    </TableCell>
    <TableCell>
      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full bg-gray-100 text-gray-900 text-sm font-medium">
        {adventure.instructors?.length || 0}
      </span>
    </TableCell>
    <TableCell className="text-left">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200 group/edit"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5 group-hover/edit:scale-110 transition-transform duration-200" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 group/delete"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5 group-hover/delete:scale-110 transition-transform duration-200" />
          Delete
        </Button>
      </div>
    </TableCell>
  </TableRow>
)

export default AdventureTableRow
