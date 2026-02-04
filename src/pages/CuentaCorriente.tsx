import { ArrowLeft, Wallet, Building2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Datos mock para demostración
const resumenCuenta = {
  cliente: 'Cliente Demo S.A.',
  numeroCliente: '12345',
  saldoActual: 125000,
  saldoVencido: 25000,
  limiteCredito: 200000,
  disponible: 75000,
};

const movimientos = [
  { id: 1, fecha: '2026-01-20', comprobante: 'Factura', numero: 'A-0001-00045678', debito: 45000, credito: 0, saldo: 125000, estado: 'pendiente' },
  { id: 2, fecha: '2026-01-18', comprobante: 'Pago', numero: 'REC-00234', debito: 0, credito: 30000, saldo: 80000, estado: 'aplicado' },
  { id: 3, fecha: '2026-01-15', comprobante: 'Factura', numero: 'A-0001-00045677', debito: 60000, credito: 0, saldo: 110000, estado: 'vencido' },
  { id: 4, fecha: '2026-01-10', comprobante: 'NC', numero: 'A-0001-00001234', debito: 0, credito: 5000, saldo: 50000, estado: 'aplicado' },
  { id: 5, fecha: '2026-01-05', comprobante: 'Factura', numero: 'A-0001-00045676', debito: 55000, credito: 0, saldo: 55000, estado: 'pagado' },
  { id: 6, fecha: '2025-12-28', comprobante: 'Pago', numero: 'REC-00233', debito: 0, credito: 40000, saldo: 0, estado: 'aplicado' },
  { id: 7, fecha: '2025-12-20', comprobante: 'Factura', numero: 'A-0001-00045675', debito: 40000, credito: 0, saldo: 40000, estado: 'pagado' },
];

const datosBancarios = [
  {
    id: 1,
    banco: 'Banco Nación',
    titular: 'Casa Fabio S.R.L.',
    cuit: '30-12345678-9',
    cbu: '0110012340012345678901',
    alias: 'CASA.FABIO.NACION',
    numeroCuenta: '12345678/90',
    sucursal: 'Suc. Centro - 001',
  },
  {
    id: 2,
    banco: 'Banco Galicia',
    titular: 'Casa Fabio S.R.L.',
    cuit: '30-12345678-9',
    cbu: '0070012340012345678902',
    alias: 'CASA.FABIO.GALICIA',
    numeroCuenta: '4012345-6 078-9',
    sucursal: 'Suc. Microcentro',
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return <Badge variant="outline" className="text-warning border-warning">Pendiente</Badge>;
    case 'vencido':
      return <Badge variant="destructive">Vencido</Badge>;
    case 'pagado':
      return <Badge className="bg-primary hover:bg-primary/80">Pagado</Badge>;
    case 'aplicado':
      return <Badge variant="secondary">Aplicado</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
};

const CuentaCorriente = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen max-h-[600px] bg-background flex flex-col overflow-hidden">
      {/* Header with summary */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md shrink-0">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              <h1 className="text-lg font-semibold">Cuenta Corriente</h1>
            </div>
          </div>
          {/* Inline summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Saldo:</span>
              <span className="font-bold">{formatCurrency(resumenCuenta.saldoActual)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-muted-foreground">Vencido:</span>
              <span className="font-bold text-destructive">{formatCurrency(resumenCuenta.saldoVencido)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col gap-4 overflow-hidden min-h-0">
        {/* Summary cards - compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
          <div className="p-2 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground">Saldo Actual</p>
            <p className="text-sm font-bold">{formatCurrency(resumenCuenta.saldoActual)}</p>
          </div>
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-muted-foreground">Saldo Vencido</p>
            <p className="text-sm font-bold text-destructive">{formatCurrency(resumenCuenta.saldoVencido)}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground">Límite Crédito</p>
            <p className="text-sm font-bold">{formatCurrency(resumenCuenta.limiteCredito)}</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Disponible</p>
            <p className="text-sm font-bold text-primary">{formatCurrency(resumenCuenta.disponible)}</p>
          </div>
        </div>

        {/* Movements table */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="py-2 px-4 shrink-0">
            <CardTitle className="text-sm">Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-xs">Fecha</TableHead>
                    <TableHead className="w-[70px] text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Número</TableHead>
                    <TableHead className="text-right w-[90px] text-xs">Débito</TableHead>
                    <TableHead className="text-right w-[90px] text-xs">Crédito</TableHead>
                    <TableHead className="text-right w-[90px] text-xs">Saldo</TableHead>
                    <TableHead className="w-[80px] text-center text-xs">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.map((mov) => (
                    <TableRow key={mov.id} className="text-xs">
                      <TableCell className="font-mono py-2">
                        {new Date(mov.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="font-normal text-xs px-1.5 py-0">
                          {mov.comprobante}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono py-2">{mov.numero}</TableCell>
                      <TableCell className="text-right font-mono py-2">
                        {mov.debito > 0 ? formatCurrency(mov.debito) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary py-2">
                        {mov.credito > 0 ? formatCurrency(mov.credito) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold py-2">
                        {formatCurrency(mov.saldo)}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {getEstadoBadge(mov.estado)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Bank data - compact */}
        <div className="shrink-0">
          <h2 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            Datos Bancarios para Depósitos
          </h2>
          <div className="grid md:grid-cols-2 gap-2">
            {datosBancarios.map((cuenta) => (
              <Card key={cuenta.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded bg-accent/10">
                      <CreditCard className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 space-y-1 text-xs">
                      <div className="font-semibold">{cuenta.banco}</div>
                      <div className="grid grid-cols-2 gap-x-2 text-muted-foreground">
                        <span>CBU:</span>
                        <span className="text-foreground font-mono truncate">{cuenta.cbu}</span>
                        <span>Alias:</span>
                        <span className="text-foreground font-mono">{cuenta.alias}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CuentaCorriente;
