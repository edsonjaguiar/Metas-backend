-- Índice composto para daily_task_completions (user_id + date)
-- Otimiza queries que filtram por usuário e data
CREATE INDEX IF NOT EXISTS idx_daily_task_completions_user_date 
ON daily_task_completions(user_id, date);

-- Índice composto para goal_completions (user_id + completed_at)
-- Otimiza queries que contam metas completadas por período
CREATE INDEX IF NOT EXISTS idx_goal_completions_user_completed 
ON goal_completions(user_id, completed_at);

-- Índice para user_achievements (user_id)
-- Otimiza queries que buscam conquistas do usuário
CREATE INDEX IF NOT EXISTS idx_user_achievements_user 
ON user_achievements(user_id);

-- Índice para goals (user_id)
-- Otimiza queries que buscam metas do usuário
CREATE INDEX IF NOT EXISTS idx_goals_user 
ON goals(user_id);
