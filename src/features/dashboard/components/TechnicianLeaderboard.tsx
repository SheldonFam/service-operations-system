import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { TechnicianKPI } from '../hooks/useDashboard'

interface TechnicianLeaderboardProps {
  technicians: TechnicianKPI[]
}

export function TechnicianLeaderboard({ technicians }: TechnicianLeaderboardProps) {
  if (technicians.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Technician Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No technician data available for this period.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Technician Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="sr-only">
              Technician performance ranking by jobs completed and revenue. Revenue column is hidden on small screens.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="w-12 text-center">
                  #
                </TableHead>
                <TableHead scope="col">Technician</TableHead>
                <TableHead scope="col" className="text-right">
                  Jobs
                </TableHead>
                <TableHead scope="col" className="hidden text-right sm:table-cell">
                  Revenue
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Postponed
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech, index) => (
                <TableRow key={tech.id}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{tech.name}</TableCell>
                  <TableCell className="text-right">{tech.jobs_completed}</TableCell>
                  <TableCell className="hidden text-right sm:table-cell">{formatCurrency(tech.total_amount)}</TableCell>
                  <TableCell className="text-right">{tech.postpone_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
