-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'operator');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'commercial', 'land');
CREATE TYPE property_status AS ENUM ('rented', 'own_use', 'vacant');
CREATE TYPE ticket_category AS ENUM ('eletrica','hidraulica','alvenaria','pintura','serralheria','ar_cond','jardim','limpeza','outros');
CREATE TYPE ticket_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE ticket_status AS ENUM ('open', 'analyzing', 'quote_pending', 'approved', 'in_progress', 'completed', 'validated', 'cancelled');
CREATE TYPE ticket_origin AS ENUM ('tenant', 'inspection', 'preventive', 'emergency');
CREATE TYPE attachment_type AS ENUM ('before', 'after', 'invoice', 'document');

-- USUÁRIOS
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role DEFAULT 'operator',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IMÓVEIS
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nickname TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zipcode TEXT,
  property_type property_type,
  area_m2 NUMERIC,
  rooms INT,
  status property_status,
  tenant_name TEXT,
  tenant_contact TEXT,
  cover_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATIVOS DO IMÓVEL
CREATE TABLE property_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  install_date DATE,
  warranty_until DATE,
  next_maintenance_date DATE,
  maintenance_interval_months INT
);

-- CHAMADOS / ORDENS DE SERVIÇO
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  category ticket_category,
  severity ticket_severity,
  status ticket_status DEFAULT 'open',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  origin ticket_origin,
  sla_deadline TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,
  estimated_total NUMERIC,
  actual_total NUMERIC,
  labor_estimated NUMERIC,
  labor_actual NUMERIC,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATÁLOGO DE MATERIAIS
CREATE TABLE materials_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  category TEXT,
  brand TEXT,
  default_unit TEXT,
  last_price NUMERIC,
  preferred_supplier TEXT
);

-- MATERIAIS DO CHAMADO
CREATE TABLE order_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials_catalog(id) ON DELETE SET NULL,
  name TEXT,
  quantity NUMERIC,
  unit TEXT,
  estimated_unit_price NUMERIC,
  actual_unit_price NUMERIC,
  supplier TEXT,
  invoice_url TEXT,
  purchased BOOLEAN DEFAULT FALSE
);

-- ANEXOS / FOTOS
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  type attachment_type,
  file_url TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMENTÁRIOS
CREATE TABLE order_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MANUTENÇÃO PREVENTIVA
CREATE TABLE preventive_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES property_assets(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  interval_months INT,
  next_run_date DATE,
  active BOOLEAN DEFAULT TRUE
);

-- NOTIFICAÇÕES
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONFIGURAÇÕES
CREATE TABLE settings (
  owner_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  approval_threshold NUMERIC DEFAULT 500,
  default_sla_critical_hours INT DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
