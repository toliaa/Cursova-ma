-- Create scholarships table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scholarships (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create allowances table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.allowances (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scholarships_student_id ON public.scholarships(student_id);
CREATE INDEX IF NOT EXISTS idx_allowances_student_id ON public.allowances(student_id);

-- Grant permissions to authenticated users
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowances ENABLE ROW LEVEL SECURITY;

-- Create policies for scholarships
CREATE POLICY "Admins can do anything with scholarships"
  ON public.scholarships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view their own scholarships"
  ON public.scholarships
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Create policies for allowances
CREATE POLICY "Admins can do anything with allowances"
  ON public.allowances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view their own allowances"
  ON public.allowances
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());
