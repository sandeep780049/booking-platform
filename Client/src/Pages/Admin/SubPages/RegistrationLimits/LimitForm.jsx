import { Label } from "../../../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";

export const LimitForm = ({
    formData,
    adventures,
    locations,
    isCreating,
    onFormChange,
    onAdventureChange,
    onSubmit,
}) => {
    return (
        <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">
                Create New Limit
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Adventure</Label>
                        <Select value={formData.adventure} onValueChange={onAdventureChange}>
                            <SelectTrigger className="border-gray-300">
                                <SelectValue placeholder="Select adventure" />
                            </SelectTrigger>
                            <SelectContent>
                                {adventures.map((adventure) => (
                                    <SelectItem key={adventure._id} value={adventure._id}>
                                        {adventure.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Location</Label>
                        <Select
                            value={formData.location}
                            onValueChange={(value) =>
                                onFormChange({ ...formData, location: value })
                            }
                            disabled={!formData.adventure}
                        >
                            <SelectTrigger className="border-gray-300">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem key={location._id} value={location._id}>
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Limit</Label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.limit}
                            onChange={(e) =>
                                onFormChange({ ...formData, limit: e.target.value })
                            }
                            placeholder="Enter limit"
                            className="border-gray-300"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-black hover:bg-gray-800 text-white"
                >
                    {isCreating ? "Creating..." : "Create Limit"}
                </Button>
            </form>
        </Card>
    );
};
