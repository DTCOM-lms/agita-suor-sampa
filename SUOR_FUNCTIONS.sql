-- Executar no Supabase SQL Editor
-- Função para atualizar saldo SUOR do usuário

CREATE OR REPLACE FUNCTION update_user_suor(
  user_id UUID,
  amount_change DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL(10,2);
  new_balance DECIMAL(10,2);
BEGIN
  -- Buscar saldo atual
  SELECT current_suor INTO current_balance
  FROM profiles
  WHERE id = user_id;

  -- Calcular novo saldo
  new_balance := current_balance + amount_change;
  
  -- Não permitir saldo negativo
  IF new_balance < 0 THEN
    new_balance := 0;
  END IF;

  -- Atualizar perfil
  UPDATE profiles 
  SET 
    current_suor = new_balance,
    total_suor = CASE 
      WHEN amount_change > 0 THEN total_suor + amount_change 
      ELSE total_suor 
    END,
    updated_at = NOW()
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular SUOR baseado em atividade
CREATE OR REPLACE FUNCTION calculate_activity_suor(
  activity_type_id UUID,
  duration_minutes INTEGER,
  distance_km DECIMAL DEFAULT NULL,
  user_level INTEGER DEFAULT 1
)
RETURNS DECIMAL(8,2) AS $$
DECLARE
  base_suor DECIMAL(5,2);
  intensity_mult DECIMAL(3,2);
  level_bonus DECIMAL(3,2);
  distance_bonus DECIMAL(6,2) := 0;
  final_suor DECIMAL(8,2);
  max_daily DECIMAL(8,2);
BEGIN
  -- Buscar dados do tipo de atividade
  SELECT base_suor_per_minute, intensity_multiplier 
  INTO base_suor, intensity_mult
  FROM activity_types 
  WHERE id = activity_type_id;

  -- Calcular bonus por nível (5% a mais por nível)
  level_bonus := 1 + (user_level - 1) * 0.05;

  -- Bonus por distância (se aplicável)
  IF distance_km IS NOT NULL AND distance_km > 0 THEN
    distance_bonus := distance_km * 2; -- 2 SUOR por km
  END IF;

  -- Cálculo final
  final_suor := (base_suor * duration_minutes * intensity_mult * level_bonus) + distance_bonus;

  -- Buscar limite diário
  SELECT value INTO max_daily 
  FROM suor_settings 
  WHERE key = 'max_daily_suor';

  -- Aplicar limite se definido
  IF max_daily IS NOT NULL AND final_suor > max_daily THEN
    final_suor := max_daily;
  END IF;

  RETURN ROUND(final_suor, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 