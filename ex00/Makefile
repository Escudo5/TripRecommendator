. PHONY: up down restart build rebuild clean logs shell help dev stop

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Comandos principales
up:
	@echo "$(GREEN)🚀 Iniciando contenedores en background... $(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Contenedores iniciados.  Abre http://localhost:3000$(NC)"
	@echo "$(YELLOW)💡 Usa 'make logs' para ver los logs$(NC)"

down:
	@echo "$(YELLOW)🛑 Deteniendo contenedores...$(NC)"
	docker-compose down

restart:
	@echo "$(YELLOW)🔄 Reiniciando contenedores...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Reiniciado.  Espera 5 segundos y refresca el navegador (Ctrl+Shift+R)$(NC)"

build:
	@echo "$(GREEN)🔨 Construyendo imagen...$(NC)"
	docker-compose build

rebuild:
	@echo "$(RED)🔨 Reconstruyendo desde cero (sin caché)...$(NC)"
	docker-compose down -v
	docker-compose build --no-cache
	@echo "$(GREEN)✅ Listo. Usa 'make up' para iniciar$(NC)"

clean:
	@echo "$(RED)🧹 Limpiando TODO (contenedores, volúmenes, imágenes)...$(NC)"
	docker-compose down -v
	docker system prune -f
	@echo "$(GREEN)✅ Limpieza completa$(NC)"

reset:
	@echo "$(RED)🔄 Reset completo... $(NC)"
	@make rebuild
	@make up
	@echo "$(GREEN)✅ Reset completo.  Esperando compilación...$(NC)"
	@sleep 10
	@make logs

logs:
	@echo "$(GREEN)📋 Mostrando logs (Ctrl+C para salir)... $(NC)"
	docker-compose logs -f frontend

shell:
	@echo "$(GREEN)🐚 Entrando al contenedor...$(NC)"
	docker-compose exec frontend sh

ps:
	@echo "$(GREEN)📊 Estado de contenedores:$(NC)"
	docker-compose ps

stop:
	@echo "$(YELLOW)⏸️  Pausando contenedores...$(NC)"
	docker-compose stop

dev:
	@echo "$(GREEN)👨‍💻 Modo desarrollo (up + logs en vivo)... $(NC)"
	@make up
	@sleep 3
	@make logs

status:
	@echo "$(GREEN)📊 Estado actual:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(YELLOW)🌐 Aplicación:$(NC) http://localhost:3000"
	@echo "$(YELLOW)📋 Ver logs:$(NC) make logs"

help:
	@echo "$(GREEN)📚 Comandos disponibles:$(NC)"
	@echo ""
	@echo "  $(YELLOW)make up$(NC)       - Iniciar en background (-d)"
	@echo "  $(YELLOW)make dev$(NC)      - Iniciar + ver logs en tiempo real"
	@echo "  $(YELLOW)make down$(NC)     - Detener contenedores"
	@echo "  $(YELLOW)make stop$(NC)     - Pausar contenedores (sin eliminar)"
	@echo "  $(YELLOW)make restart$(NC)  - Reiniciar rápido (para ver cambios)"
	@echo "  $(YELLOW)make build$(NC)    - Reconstruir imagen"
	@echo "  $(YELLOW)make rebuild$(NC)  - Reconstruir desde cero (limpia caché)"
	@echo "  $(YELLOW)make clean$(NC)    - Limpiar TODO (reset nuclear)"
	@echo "  $(YELLOW)make reset$(NC)    - rebuild + up + logs (reset completo)"
	@echo "  $(YELLOW)make logs$(NC)     - Ver logs en tiempo real"
	@echo "  $(YELLOW)make shell$(NC)    - Entrar al contenedor (terminal)"
	@echo "  $(YELLOW)make ps$(NC)       - Ver estado de contenedores"
	@echo "  $(YELLOW)make status$(NC)   - Resumen del estado actual"
	@echo "  $(YELLOW)make help$(NC)     - Mostrar esta ayuda"
	@echo ""
	@echo "$(GREEN)💡 Flujo de trabajo recomendado:$(NC)"
	@echo "  $(GREEN)Primera vez:$(NC)"
	@echo "    1. $(YELLOW)make rebuild$(NC) - Construir imagen"
	@echo "    2. $(YELLOW)make dev$(NC)     - Iniciar y ver logs"
	@echo ""
	@echo "  $(GREEN)Desarrollo diario:$(NC)"
	@echo "    1. $(YELLOW)make up$(NC)      - Iniciar contenedores"
	@echo "    2.  Editar código y guardar"
	@echo "    3. $(YELLOW)make restart$(NC) - Reiniciar para ver cambios"
	@echo "    4.  Ctrl+Shift+R en navegador"
	@echo "    5. $(YELLOW)make logs$(NC)    - Ver logs si hay errores"
	@echo ""
	@echo "  $(GREEN)Si algo falla:$(NC)"
	@echo "    1. $(YELLOW)make clean$(NC)   - Limpiar todo"
	@echo "    2. $(YELLOW)make reset$(NC)   - Reconstruir y arrancar"
	@echo ""
	@echo "$(YELLOW)🌐 URL:$(NC) http://localhost:3000"