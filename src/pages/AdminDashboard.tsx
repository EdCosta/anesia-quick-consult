import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const cards = [
  {
    title: 'Import procedures',
    description: 'Upload semicolon CSV and update the procedures knowledge base.',
    to: '/admin/import/procedures',
  },
  {
    title: 'Import guidelines',
    description: 'Reserved for guideline payload imports and future structured updates.',
    to: '/admin/import/guidelines',
  },
  {
    title: 'Import logs',
    description: 'Review previous imports, counts, and stored validation errors.',
    to: '/admin/logs',
  },
];

export default function AdminDashboard() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.to} className="clinical-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{card.description}</p>
            <Link to={card.to} className="text-sm font-medium text-primary hover:underline">
              Open
            </Link>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
