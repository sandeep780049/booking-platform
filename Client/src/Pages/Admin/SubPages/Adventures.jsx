import { useState } from "react"
import { Download, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Card, CardContent } from "../../../components/ui/card"
import { deleteAdventure } from "../../../Api/adventure.api"
import { toast } from "sonner"
import AdventureTableRow from "./../../../components/AdventureTableRow"
import { useAdventures } from "../../../hooks/useAdventure"
import { useNavigate } from "react-router-dom"

export default function AdventuresPage() {
  const navigate = useNavigate()

  const {
    adventures,
    isLoading,
    refetch,
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
  } = useAdventures()

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this adventure?")) {
      return
    }
    const toastId = toast.loading("Deleting adventure...")
    try {
      const res = await deleteAdventure(id)
      if (res.status === 200) {
        toast.success("Adventure deleted successfully", { id: toastId })
      }
      refetch()
    } catch (error) {
      toast.error("Error deleting adventure", { id: toastId })
      console.error(error)
    }
  }

  const handlePrev = () => setPage((p) => Math.max(1, p - 1))
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Adventures</h1>
            <p className="text-gray-600 mt-2">Manage and organize your adventure experiences</p>
          </div>
          <Button
            onClick={() => navigate("/admin/adventures/new")}
            className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            Add Adventure
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search adventures..."
                  className="pl-10 h-11 border-gray-200 focus:border-black focus:ring-black transition-all duration-200"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Location</TableHead>
                    <TableHead className="font-semibold text-gray-900">Bookings</TableHead>
                    <TableHead className="font-semibold text-gray-900">Instructors</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-left">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableHead colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                          </div>
                          <p className="text-gray-600 font-medium">Loading adventures...</p>
                        </div>
                      </TableHead>
                    </TableRow>
                  ) : adventures.length === 0 ? (
                    <TableRow>
                      <TableHead colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-900 font-semibold text-lg">No adventures found</p>
                            <p className="text-gray-500 text-sm mt-1">
                              {search ? "Try adjusting your search" : "Get started by creating your first adventure"}
                            </p>
                          </div>
                          {!search && (
                            <Button
                              onClick={() => navigate("/admin/adventures/new")}
                              className="mt-2 bg-black hover:bg-gray-800 text-white"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Adventure
                            </Button>
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  ) : (
                    adventures.map((adventure, idx) => (
                      <AdventureTableRow
                        key={adventure._id || idx}
                        adventure={adventure}
                        onEdit={() => navigate(`/admin/adventures/edit/${adventure._id}`)}
                        onDelete={() => handleDelete(adventure._id)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoading && adventures.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{adventures.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{total}</span> adventures
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePrev}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 px-3">
                    <span className="text-sm font-medium text-gray-900">Page {page}</span>
                    <span className="text-sm text-gray-500">of {totalPages}</span>
                  </div>
                  <Button
                    onClick={handleNext}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
