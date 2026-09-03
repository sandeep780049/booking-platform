import { Card } from "../../../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Pencil, Save, X, Trash2, Users } from "lucide-react";

export const LimitsTable = ({
    limits,
    editingId,
    editFormData,
    onEditStart,
    onEditChange,
    onEditSave,
    onEditCancel,
    onDelete,
    onMoveFromWaitlist,
}) => {
    if (limits.length === 0) {
        return (
            <Card className="p-6 border border-gray-200 text-center text-gray-500">
                No registration limits found. Create one above.
            </Card>
        );
    }

    return (
        <Card className="border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="text-black font-semibold">Adventure</TableHead>
                        <TableHead className="text-black font-semibold">Location</TableHead>
                        <TableHead className="text-black font-semibold">Limit</TableHead>
                        <TableHead className="text-black font-semibold">Current</TableHead>
                        <TableHead className="text-black font-semibold">Waitlist</TableHead>
                        <TableHead className="text-black font-semibold text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {limits.map((limit) => (
                        <TableRow key={limit._id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-black">
                                {limit.adventure?.name || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-700">
                                {limit.location?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                                {editingId === limit._id ? (
                                    <Input
                                        type="number"
                                        min="1"
                                        value={editFormData.limit}
                                        onChange={(e) =>
                                            onEditChange({ ...editFormData, limit: e.target.value })
                                        }
                                        className="w-20 border-gray-300"
                                    />
                                ) : (
                                    <span className="text-gray-700">{limit.limit}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className="font-medium text-black">
                                    {limit.currentCount}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-gray-700">
                                    {limit.waitlist?.length || 0}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {editingId === limit._id ? (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => onEditSave(limit._id)}
                                                className="bg-black hover:bg-gray-800 text-white"
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={onEditCancel}
                                                className="border-gray-300"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEditStart(limit)}
                                                className="border-gray-300"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {limit.waitlist?.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => onMoveFromWaitlist(limit._id)}
                                                    className="bg-black hover:bg-gray-800 text-white"
                                                    title="Move from waitlist"
                                                >
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onDelete(limit._id)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};
