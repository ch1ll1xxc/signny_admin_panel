import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Users, Activity, Calendar, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockActivityData = [
  { time: "00:00", users: 45 },
  { time: "04:00", users: 32 },
  { time: "08:00", users: 89 },
  { time: "12:00", users: 156 },
  { time: "16:00", users: 134 },
  { time: "20:00", users: 78 },
];

const mockLogs = [
  { id: 1, action: "Exhibition 'Ancient Rome' updated", user: "admin@museum.com", time: "2 hours ago" },
  { id: 2, action: "New exhibit added to 'Medieval Art'", user: "curator@museum.com", time: "4 hours ago" },
  { id: 3, action: "User 'john.doe' visited 3 exhibitions", user: "system", time: "5 hours ago" },
  { id: 4, action: "Exhibition 'Renaissance Masters' published", user: "admin@museum.com", time: "1 day ago" },
  { id: 5, action: "Exhibit metadata updated", user: "curator@museum.com", time: "1 day ago" },
];

const lastExhibition = {
  title: "Ancient Rome: City of the Caesars",
  visitors: 1234,
  lastUpdated: "February 14, 2026",
  status: "Active",
};

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">The National Museum of History</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Unique Users Today</CardTitle>
            <Users className="h-4 w-4 text-[#2B173F] dark:text-[#A193D7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Exhibitions</CardTitle>
            <Calendar className="h-4 w-4 text-[#2B173F] dark:text-[#A193D7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">12</div>
            <p className="text-xs text-muted-foreground">3 scheduled for next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Exhibits</CardTitle>
            <Activity className="h-4 w-4 text-[#2B173F] dark:text-[#A193D7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">487</div>
            <p className="text-xs text-muted-foreground">Across all exhibitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg. Visit Duration</CardTitle>
            <Activity className="h-4 w-4 text-[#2B173F] dark:text-[#A193D7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">42m</div>
            <p className="text-xs text-muted-foreground">+5m from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Activity</CardTitle>
            <CardDescription>Unique users throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#2B173F" fill="#2B173F" fillOpacity={0.2} className="dark:stroke-[#A193D7] dark:fill-[#A193D7]" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Exhibition</CardTitle>
            <CardDescription>Most recently updated exhibition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2">{lastExhibition.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Visitors</p>
                  <p>{lastExhibition.visitors.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="text-green-600">{lastExhibition.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{lastExhibition.lastUpdated}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Logs</CardTitle>
          <CardDescription>Latest actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p>{log.action}</p>
                  <p className="text-sm text-muted-foreground">by {log.user}</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap ml-4">{log.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
