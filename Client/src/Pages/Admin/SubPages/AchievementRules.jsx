import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { fetchAllAdventures } from "../../../Api/adventure.api";
import {
  // User achievement rules
  createAchievementRule,
  deleteAchievementRule,
  listAchievementRules,
  updateAchievementRule,
  evaluateMyAchievements,
  // Instructor achievement rules
  createInstructorAchievementRule,
  deleteInstructorAchievementRule,
  listInstructorAchievementRules,
  updateInstructorAchievementRule,
  evaluateAllInstructors
} from "../../../Api/user.api";
import { Trash2, Save, Plus, Play, Users, GraduationCap } from "lucide-react";
import HintTooltip from "../../../components/HintTooltip";

export default function AchievementRulesPage() {
  const GLOBAL_ALL = "__GLOBAL__";
  const [adventures, setAdventures] = useState([]);
  const [userRules, setUserRules] = useState([]);
  const [instructorRules, setInstructorRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("user");

  // Form state for user rules
  const [userForm, setUserForm] = useState({
    name: "",
    description: "",
    label: "",
    adventure: GLOBAL_ALL,
    metric: "completedSessions",
    threshold: 1,
    active: true,
  });

  // Form state for instructor rules
  const [instructorForm, setInstructorForm] = useState({
    name: "",
    description: "",
    label: "",
    adventure: GLOBAL_ALL,
    metric: "rating",
    threshold: 4.0,
    instructorCriteria: {
      minRating: 4.0,
      minMonthsSinceJoining: 0,
      minBookings: 0,
    },
    active: true,
  });

  const userMetrics = useMemo(() => ([
    { value: "completedSessions", label: "Completed Sessions" },
    { value: "confirmedBookings", label: "Confirmed Bookings" },
  ]), []);

  const instructorMetrics = useMemo(() => ([
    { value: "rating", label: "Average Rating" },
    { value: "joiningDate", label: "Months Since Joining" },
    { value: "bookingCount", label: "Total Bookings Received" },
  ]), []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [advRes, userRuleRes, instructorRuleRes] = await Promise.all([
        fetchAllAdventures(),
        listAchievementRules(),
        listInstructorAchievementRules(),
      ]);

      // Normalize adventures response into an array
      const advList = advRes?.data?.adventures || [];
      setAdventures(advList);

      // Normalize user rules response into an array
      const userRulesRaw = userRuleRes?.data;
      const userRuleList = Array.isArray(userRulesRaw?.data)
        ? userRulesRaw.data
        : Array.isArray(userRulesRaw)
          ? userRulesRaw
          : [];
      setUserRules(userRuleList);

      // Normalize instructor rules response into an array
      const instructorRulesRaw = instructorRuleRes?.data;
      const instructorRuleList = Array.isArray(instructorRulesRaw?.data)
        ? instructorRulesRaw.data
        : Array.isArray(instructorRulesRaw)
          ? instructorRulesRaw
          : [];
      setInstructorRules(instructorRuleList);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load achievements data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetUserForm = () => setUserForm({
    name: "",
    description: "",
    label: "",
    adventure: GLOBAL_ALL,
    metric: "completedSessions",
    threshold: 1,
    active: true
  });

  const resetInstructorForm = () => setInstructorForm({
    name: "",
    description: "",
    label: "",
    adventure: GLOBAL_ALL,
    metric: "rating",
    threshold: 4.0,
    instructorCriteria: {
      minRating: 4.0,
      minMonthsSinceJoining: 0,
      minBookings: 0,
    },
    active: true
  });

  const onCreateUser = async () => {
    if (!userForm.name?.trim()) return toast.error("Name is required");
    if (!userForm.threshold || userForm.threshold < 1) return toast.error("Threshold must be >= 1");
    setSaving(true);
    try {
      const payload = { ...userForm };
      if (payload.adventure === GLOBAL_ALL) payload.adventure = null;
      const res = await createAchievementRule(payload);
      toast.success(res?.message || "User achievement rule created");
      resetUserForm();
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to create user achievement rule");
    } finally {
      setSaving(false);
    }
  };

  const onCreateInstructor = async () => {
    if (!instructorForm.name?.trim()) return toast.error("Name is required");
    if (!instructorForm.threshold || instructorForm.threshold < 0) return toast.error("Threshold must be >= 0");

    // Validation based on metric type
    if (instructorForm.metric === "rating" && (!instructorForm.instructorCriteria.minRating || instructorForm.instructorCriteria.minRating < 0 || instructorForm.instructorCriteria.minRating > 5)) {
      return toast.error("Minimum rating must be between 0 and 5");
    }
    if (instructorForm.metric === "joiningDate" && (!instructorForm.instructorCriteria.minMonthsSinceJoining || instructorForm.instructorCriteria.minMonthsSinceJoining < 0)) {
      return toast.error("Minimum months since joining must be >= 0");
    }
    if (instructorForm.metric === "bookingCount" && (!instructorForm.instructorCriteria.minBookings || instructorForm.instructorCriteria.minBookings < 0)) {
      return toast.error("Minimum bookings must be >= 0");
    }

    setSaving(true);
    try {
      const payload = { ...instructorForm };
      if (payload.adventure === GLOBAL_ALL) payload.adventure = null;
      const res = await createInstructorAchievementRule(payload);
      toast.success(res?.message || "Instructor achievement rule created");
      resetInstructorForm();
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to create instructor achievement rule");
    } finally {
      setSaving(false);
    }
  };

  const onToggleUser = async (rule) => {
    try {
      await updateAchievementRule(rule._id, { active: !rule.active });
      await loadData();
    } catch (e) {
      toast.error("Failed to update user achievement rule");
    }
  };

  const onToggleInstructor = async (rule) => {
    try {
      await updateInstructorAchievementRule(rule._id, { active: !rule.active });
      await loadData();
    } catch (e) {
      toast.error("Failed to update instructor achievement rule");
    }
  };

  const onUpdateUser = async (rule) => {
    try {
      await updateAchievementRule(rule._id, rule);
      toast.success("User achievement rule updated");
      await loadData();
    } catch (e) {
      toast.error("Failed to update user achievement rule");
    }
  };

  const onUpdateInstructor = async (rule) => {
    try {
      await updateInstructorAchievementRule(rule._id, rule);
      toast.success("Instructor achievement rule updated");
      await loadData();
    } catch (e) {
      toast.error("Failed to update instructor achievement rule");
    }
  };

  const onDeleteUser = async (rule) => {
    if (!confirm(`Delete user achievement rule "${rule.name || rule.title}"?`)) return;
    try {
      await deleteAchievementRule(rule._id);
      toast.success("User achievement rule deleted");
      await loadData();
    } catch (e) {
      toast.error("Failed to delete user achievement rule");
    }
  };

  const onDeleteInstructor = async (rule) => {
    if (!confirm(`Delete instructor achievement rule "${rule.name || rule.title}"?`)) return;
    try {
      await deleteInstructorAchievementRule(rule._id);
      toast.success("Instructor achievement rule deleted");
      await loadData();
    } catch (e) {
      toast.error("Failed to delete instructor achievement rule");
    }
  };

  const onEvaluateAllUsers = async () => {
    try {
      setSaving(true);
      const res = await evaluateMyAchievements();
      toast.success(res?.message || "User achievements evaluated");
    } catch (e) {
      toast.error("Failed to evaluate user achievements");
    } finally {
      setSaving(false);
    }
  };

  const onEvaluateAllInstructors = async () => {
    try {
      setSaving(true);
      const res = await evaluateAllInstructors();
      toast.success(res?.message || "All instructor achievements evaluated");
    } catch (e) {
      toast.error("Failed to evaluate instructor achievements");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Achievement Rules</h2>
        <div className="flex gap-2">
          <Button onClick={onEvaluateAllUsers} disabled={saving} variant="outline">
            <Users className="h-4 w-4 mr-2" /> Evaluate Users
          </Button>
          <Button onClick={onEvaluateAllInstructors} disabled={saving} variant="outline">
            <GraduationCap className="h-4 w-4 mr-2" /> Evaluate Instructors
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Achievement Rules
          </TabsTrigger>
          <TabsTrigger value="instructor" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Instructor Achievement Rules
          </TabsTrigger>
        </TabsList>

        {/* User Achievement Rules Tab */}
        <TabsContent value="user" className="space-y-6">
          {/* Create new user rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create User Achievement Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Name
                  <HintTooltip content="The display name for this achievement that users will see when they earn it." />
                </label>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Adventure Explorer"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Label (Category)
                  <HintTooltip content="Category or tag for grouping similar achievements together." />
                </label>
                <Input
                  value={userForm.label}
                  onChange={(e) => setUserForm({ ...userForm, label: e.target.value })}
                  placeholder="Tree Climbing"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  Description
                  <HintTooltip content="A brief description explaining what the user needs to do to earn this achievement." />
                </label>
                <Input
                  value={userForm.description}
                  onChange={(e) => setUserForm({ ...userForm, description: e.target.value })}
                  placeholder="Complete 10 climbs"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Adventure (optional)
                  <HintTooltip content="Specify a specific adventure this achievement applies to, or leave as Global for all adventures." />
                </label>
                <Select value={userForm.adventure} onValueChange={(v) => setUserForm({ ...userForm, adventure: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Global (All)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GLOBAL_ALL}>Global (All Adventures)</SelectItem>
                    {Array.isArray(adventures) && adventures.map((a) => (
                      <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Metric
                  <HintTooltip content="The metric to track: Completed Sessions (finished bookings) or Confirmed Bookings (scheduled bookings)." />
                </label>
                <Select value={userForm.metric} onValueChange={(v) => setUserForm({ ...userForm, metric: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userMetrics.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Threshold
                  <HintTooltip content="The minimum number required to earn this achievement (e.g., 10 for 'Complete 10 sessions')." />
                </label>
                <Input
                  type="number"
                  min={1}
                  value={userForm.threshold}
                  onChange={(e) => setUserForm({ ...userForm, threshold: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch
                  checked={userForm.active}
                  onCheckedChange={(v) => setUserForm({ ...userForm, active: v })}
                />
                <span className="flex items-center gap-2">
                  Active
                  <HintTooltip content="Enable or disable this achievement rule. Inactive rules won't be evaluated." />
                </span>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                <Button onClick={onCreateUser} disabled={saving} className="bg-black text-white">
                  <Plus className="h-4 w-4 mr-2" /> Create User Rule
                </Button>
                <Button variant="outline" onClick={resetUserForm}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing user rules */}
          <Card>
            <CardHeader>
              <CardTitle>Existing User Achievement Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Adventure</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
                  ) : userRules?.length === 0 ? (
                    <TableRow><TableCell colSpan={7}>No user achievement rules found</TableCell></TableRow>
                  ) : (
                    userRules.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium">{r.name || r.title}</TableCell>
                        <TableCell>{r.label || "-"}</TableCell>
                        <TableCell>{r.adventure ? (Array.isArray(adventures) ? adventures.find(a => a._id === r.adventure)?.name : null) || r.adventure : "Global"}</TableCell>
                        <TableCell>{r.metric}</TableCell>
                        <TableCell>{r.threshold}</TableCell>
                        <TableCell>
                          <Switch checked={!!r.active} onCheckedChange={() => onToggleUser(r)} />
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => onUpdateUser(r)}>
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDeleteUser(r)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructor Achievement Rules Tab */}
        <TabsContent value="instructor" className="space-y-6">
          {/* Create new instructor rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Create Instructor Achievement Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Name
                  <HintTooltip content="The display name for this instructor achievement badge." />
                </label>
                <Input
                  value={instructorForm.name}
                  onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                  placeholder="Elite Instructor"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Label (Category)
                  <HintTooltip content="Category or tier for this instructor achievement." />
                </label>
                <Input
                  value={instructorForm.label}
                  onChange={(e) => setInstructorForm({ ...instructorForm, label: e.target.value })}
                  placeholder="Expert Guide"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  Description
                  <HintTooltip content="A brief description of what instructors need to achieve to earn this badge." />
                </label>
                <Input
                  value={instructorForm.description}
                  onChange={(e) => setInstructorForm({ ...instructorForm, description: e.target.value })}
                  placeholder="Achieve 4.8+ rating with 100+ bookings"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Adventure (optional)
                  <HintTooltip content="Limit this achievement to a specific adventure, or leave as Global for all adventures." />
                </label>
                <Select value={instructorForm.adventure} onValueChange={(v) => setInstructorForm({ ...instructorForm, adventure: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Global (All)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GLOBAL_ALL}>Global (All Adventures)</SelectItem>
                    {Array.isArray(adventures) && adventures.map((a) => (
                      <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Primary Metric
                  <HintTooltip content="The main metric to evaluate: Average Rating (0-5), Months Since Joining, or Total Bookings Received." />
                </label>
                <Select value={instructorForm.metric} onValueChange={(v) => setInstructorForm({ ...instructorForm, metric: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {instructorMetrics.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Primary Threshold
                  <HintTooltip content="The minimum value required for the primary metric to earn this achievement." />
                </label>
                <Input
                  type="number"
                  min={0}
                  step={instructorForm.metric === "rating" ? 0.1 : 1}
                  value={instructorForm.threshold}
                  onChange={(e) => setInstructorForm({ ...instructorForm, threshold: Number(e.target.value) })}
                />
              </div>

              {/* Instructor Criteria Fields */}
              <div className="md:col-span-2 lg:col-span-3">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Additional Criteria (Optional)
                  <HintTooltip content="Set additional requirements that instructors must meet alongside the primary metric." />
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      Min Rating (0-5)
                      <HintTooltip content="Minimum average rating the instructor must have (0-5 scale)." />
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={instructorForm.instructorCriteria.minRating}
                      onChange={(e) => setInstructorForm({
                        ...instructorForm,
                        instructorCriteria: {
                          ...instructorForm.instructorCriteria,
                          minRating: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      Min Months Since Joining
                      <HintTooltip content="Minimum number of months the instructor must have been on the platform." />
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={instructorForm.instructorCriteria.minMonthsSinceJoining}
                      onChange={(e) => setInstructorForm({
                        ...instructorForm,
                        instructorCriteria: {
                          ...instructorForm.instructorCriteria,
                          minMonthsSinceJoining: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      Min Bookings Received
                      <HintTooltip content="Minimum total number of bookings the instructor must have received." />
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={instructorForm.instructorCriteria.minBookings}
                      onChange={(e) => setInstructorForm({
                        ...instructorForm,
                        instructorCriteria: {
                          ...instructorForm.instructorCriteria,
                          minBookings: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <Switch
                  checked={instructorForm.active}
                  onCheckedChange={(v) => setInstructorForm({ ...instructorForm, active: v })}
                />
                <span className="flex items-center gap-2">
                  Active
                  <HintTooltip content="Enable or disable this instructor achievement rule. Inactive rules won't be evaluated." />
                </span>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                <Button onClick={onCreateInstructor} disabled={saving} className="bg-black text-white">
                  <Plus className="h-4 w-4 mr-2" /> Create Instructor Rule
                </Button>
                <Button variant="outline" onClick={resetInstructorForm}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing instructor rules */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Instructor Achievement Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Adventure</TableHead>
                    <TableHead>Primary Metric</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
                  ) : instructorRules?.length === 0 ? (
                    <TableRow><TableCell colSpan={8}>No instructor achievement rules found</TableCell></TableRow>
                  ) : (
                    instructorRules.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium">
                          {r.name || r.title}
                        </TableCell>
                        <TableCell>{r.label || "-"}</TableCell>
                        <TableCell>{r.adventure ? (Array.isArray(adventures) ? adventures.find(a => a._id === r.adventure)?.name : null) || r.adventure : "Global"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.metric}</Badge>
                        </TableCell>
                        <TableCell>{r.threshold}</TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            {r.instructorCriteria?.minRating && (
                              <div>Rating: {r.instructorCriteria.minRating}+</div>
                            )}
                            {r.instructorCriteria?.minMonthsSinceJoining && (
                              <div>Experience: {r.instructorCriteria.minMonthsSinceJoining}+ months</div>
                            )}
                            {r.instructorCriteria?.minBookings && (
                              <div>Bookings: {r.instructorCriteria.minBookings}+</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch checked={!!r.active} onCheckedChange={() => onToggleInstructor(r)} />
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => onUpdateInstructor(r)}>
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDeleteInstructor(r)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
