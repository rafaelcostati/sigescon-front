{
"openapi": "3.1.0",
"info": {
"title": "SIGESCON API",
"version": "2.0.0"
},
"paths": {
"/auth/login": {
"post": {
"tags": [
"Autenticação"
],
"summary": "Login do usuário com seleção de perfil",
"operationId": "login_for_access_token_auth_login_post",
"parameters": [
{
"name": "perfil_inicial_id",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Perfil Inicial Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/x-www-form-urlencoded": {
"schema": {
"$ref": "#/components/schemas/Body_login_for_access_token_auth_login_post"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/LoginResponse"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/auth/login-com-perfil": {
"post": {
"tags": [
"Autenticação"
],
"summary": "Login com perfil específico",
"description": "Login especificando um perfil específico no corpo da requisição",
"operationId": "login_with_specific_profile_auth_login_com_perfil_post",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/LoginComPerfilRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/LoginResponse"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/auth/alternar-perfil": {
"post": {
"tags": [
"Autenticação"
],
"summary": "Alternar perfil ativo na sessão",
"description": "Alterna o perfil ativo na sessão atual",
"operationId": "switch_profile_auth_alternar_perfil_post",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/AlternarPerfilRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ContextoSessao"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/auth/contexto": {
"get": {
"tags": [
"Autenticação"
],
"summary": "Get Current Context Fixed",
"operationId": "get_current_context_fixed_auth_contexto_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ContextoSessao"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/auth/dashboard": {
"get": {
"tags": [
"Autenticação"
],
"summary": "Get Dashboard Data Fixed",
"operationId": "get_dashboard_data_fixed_auth_dashboard_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/DashboardData"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/auth/permissoes": {
"get": {
"tags": [
"Autenticação"
],
"summary": "Get Contextual Permissions Fixed",
"operationId": "get_contextual_permissions_fixed_auth_permissoes_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/PermissaoContextual"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/auth/logout": {
"post": {
"tags": [
"Autenticação"
],
"summary": "Logout",
"operationId": "logout_auth_logout_post",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/auth/login-legacy": {
"post": {
"tags": [
"Autenticação"
],
"summary": "Login Legacy",
"description": "Endpoint de login original (mantido para compatibilidade)",
"operationId": "login_legacy_auth_login_legacy_post",
"requestBody": {
"content": {
"application/x-www-form-urlencoded": {
"schema": {
"$ref": "#/components/schemas/Body_login_legacy_auth_login_legacy_post"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Token"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Get User Profiles",
"description": "Lista todos os perfis ativos de um usuário específico",
"operationId": "get_user_profiles_api_v1_usuarios__usuario_id__perfis_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/UsuarioPerfil"
},
"title": "Response Get User Profiles Api V1 Usuarios  Usuario Id  Perfis Get"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis/completo": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Get User Complete Info",
"description": "Busca informações completas do usuário incluindo todos os perfis",
"operationId": "get_user_complete_info_api_v1_usuarios__usuario_id__perfis_completo_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioComPerfis"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis/conceder": {
"post": {
"tags": [
"Perfis de Usuários"
],
"summary": "Grant Profiles To User",
"description": "Concede múltiplos perfis a um usuário (Requer permissão de administrador)",
"operationId": "grant_profiles_to_user_api_v1_usuarios__usuario_id__perfis_conceder_post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioPerfilGrantRequest"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/UsuarioPerfil"
},
"title": "Response Grant Profiles To User Api V1 Usuarios  Usuario Id  Perfis Conceder Post"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis/revogar": {
"post": {
"tags": [
"Perfis de Usuários"
],
"summary": "Revoke Profiles From User",
"description": "Revoga múltiplos perfis de um usuário (Requer permissão de administrador)",
"operationId": "revoke_profiles_from_user_api_v1_usuarios__usuario_id__perfis_revogar_post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioPerfilRevokeRequest"
}
}
}
},
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis/historico": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Get Profile History",
"description": "Busca histórico completo de concessão/remoção de perfis de um usuário",
"operationId": "get_profile_history_api_v1_usuarios__usuario_id__perfis_historico_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/HistoricoPerfilConcessao"
},
"title": "Response Get Profile History Api V1 Usuarios  Usuario Id  Perfis Historico Get"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis/validacao": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Validate User Permissions",
"description": "Valida as permissões e capacidades de um usuário",
"operationId": "validate_user_permissions_api_v1_usuarios__usuario_id__perfis_validacao_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ValidacaoPerfil"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/fiscais-disponiveis": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Get Available Fiscals",
"description": "Lista todos os usuários que podem exercer função de fiscal",
"operationId": "get_available_fiscals_api_v1_usuarios_fiscais_disponiveis_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/UsuarioComPerfis"
},
"type": "array",
"title": "Response Get Available Fiscals Api V1 Usuarios Fiscais Disponiveis Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/usuarios/gestores-disponiveis": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Get Available Managers",
"description": "Lista todos os usuários que podem exercer função de gestor",
"operationId": "get_available_managers_api_v1_usuarios_gestores_disponiveis_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/UsuarioComPerfis"
},
"type": "array",
"title": "Response Get Available Managers Api V1 Usuarios Gestores Disponiveis Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/usuarios/por-perfil/{perfil_name}": {
"get": {
"tags": [
"Perfis de Usuários"
],
"summary": "Get Users By Profile",
"description": "Lista todos os usuários que possuem um perfil específico",
"operationId": "get_users_by_profile_api_v1_usuarios_por_perfil__perfil_name__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "perfil_name",
"in": "path",
"required": true,
"schema": {
"type": "string",
"title": "Perfil Name"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/PerfilWithUsers"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{usuario_id}/perfis/migrar": {
"post": {
"tags": [
"Perfis de Usuários"
],
"summary": "Migrate User To Multiple Profiles",
"description": "Migra um usuário do sistema de perfil único para perfis múltiplos",
"operationId": "migrate_user_to_multiple_profiles_api_v1_usuarios__usuario_id__perfis_migrar_post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "usuario_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Usuario Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioComPerfis"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/perfis/conceder-lote": {
"post": {
"tags": [
"Perfis de Usuários"
],
"summary": "Bulk Grant Profile",
"description": "Concede um perfil a múltiplos usuários de uma vez",
"operationId": "bulk_grant_profile_api_v1_usuarios_perfis_conceder_lote_post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "perfil_id",
"in": "query",
"required": true,
"schema": {
"type": "integer",
"title": "Perfil Id"
}
},
{
"name": "observacoes",
"in": "query",
"required": false,
"schema": {
"type": "string",
"title": "Observacoes"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"type": "integer"
},
"title": "Usuario Ids"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/me": {
"get": {
"tags": [
"Usuários"
],
"summary": "Obter dados do usuário logado",
"description": "Retorna os dados do usuário atualmente autenticado.\n\nRequer autenticação válida.",
"operationId": "read_users_me_api_v1_usuarios_me_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Usuario"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/usuarios/": {
"get": {
"tags": [
"Usuários"
],
"summary": "Listar todos os usuários",
"description": "Lista todos os usuários ativos do sistema com paginação.\n\nPermite filtrar por nome (busca parcial).\n\n**Requer permissão de administrador.**",
"operationId": "list_users_api_v1_usuarios__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "page",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"minimum": 1,
"description": "Número da página",
"default": 1,
"title": "Page"
},
"description": "Número da página"
},
{
"name": "per_page",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"maximum": 100,
"minimum": 1,
"description": "Itens por página",
"default": 10,
"title": "Per Page"
},
"description": "Itens por página"
},
{
"name": "nome",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"description": "Filtrar por nome (busca parcial)",
"title": "Nome"
},
"description": "Filtrar por nome (busca parcial)"
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioPaginated"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"post": {
"tags": [
"Usuários"
],
"summary": "Criar novo usuário",
"description": "Cria um novo usuário no sistema.\n\n**Requer permissão de administrador.**\n\nValidações:\n- Email deve ser único\n- CPF deve ter 11 dígitos\n- Senha deve ter no mínimo 6 caracteres",
"operationId": "create_user_api_v1_usuarios__post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioCreate"
}
}
}
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Usuario"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{user_id}": {
"get": {
"tags": [
"Usuários"
],
"summary": "Buscar usuário por ID",
"description": "Busca um usuário específico pelo ID.\n\n**Requer autenticação válida.**",
"operationId": "get_user_by_id_api_v1_usuarios__user_id__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "user_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "User Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Usuario"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"patch": {
"tags": [
"Usuários"
],
"summary": "Atualizar usuário",
"description": "Atualiza os dados de um usuário existente.\n\nTodos os campos são opcionais - apenas os fornecidos serão atualizados.\n\n**Requer permissão de administrador.**",
"operationId": "update_user_api_v1_usuarios__user_id__patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "user_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "User Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioUpdate"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Usuario"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"delete": {
"tags": [
"Usuários"
],
"summary": "Deletar usuário",
"description": "Realiza soft delete de um usuário (marca como inativo).\n\n**Requer permissão de administrador.**",
"operationId": "delete_user_api_v1_usuarios__user_id__delete",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "user_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "User Id"
}
}
],
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{user_id}/alterar-senha": {
"patch": {
"tags": [
"Usuários"
],
"summary": "Alterar própria senha",
"description": "Permite que um usuário altere sua própria senha.\n\nO usuário deve fornecer a senha antiga correta.\n\n**Nota:** Usuários só podem alterar sua própria senha.",
"operationId": "change_password_api_v1_usuarios__user_id__alterar_senha_patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "user_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "User Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioChangePassword"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/usuarios/{user_id}/resetar-senha": {
"patch": {
"tags": [
"Usuários"
],
"summary": "Resetar senha de usuário",
"description": "Permite que um administrador resete a senha de qualquer usuário.\n\n**Requer permissão de administrador.**",
"operationId": "reset_password_api_v1_usuarios__user_id__resetar_senha_patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "user_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "User Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UsuarioResetPassword"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratados/": {
"post": {
"tags": [
"Contratados"
],
"summary": "Create Contratado",
"operationId": "create_contratado_api_v1_contratados__post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ContratadoCreate"
}
}
}
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Contratado"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"get": {
"tags": [
"Contratados"
],
"summary": "Get All Contratados",
"operationId": "get_all_contratados_api_v1_contratados__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "page",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"minimum": 1,
"description": "Número da página",
"default": 1,
"title": "Page"
},
"description": "Número da página"
},
{
"name": "per_page",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"maximum": 100,
"minimum": 1,
"description": "Itens por página",
"default": 10,
"title": "Per Page"
},
"description": "Itens por página"
},
{
"name": "nome",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"description": "Filtrar por nome",
"title": "Nome"
},
"description": "Filtrar por nome"
},
{
"name": "cnpj",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"description": "Filtrar por CNPJ",
"title": "Cnpj"
},
"description": "Filtrar por CNPJ"
},
{
"name": "cpf",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"description": "Filtrar por CPF",
"title": "Cpf"
},
"description": "Filtrar por CPF"
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ContratadoPaginated"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratados/{contratado_id}": {
"get": {
"tags": [
"Contratados"
],
"summary": "Get Contratado By Id",
"operationId": "get_contratado_by_id_api_v1_contratados__contratado_id__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contratado_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contratado Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Contratado"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"patch": {
"tags": [
"Contratados"
],
"summary": "Update Contratado",
"operationId": "update_contratado_api_v1_contratados__contratado_id__patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contratado_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contratado Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ContratadoUpdate"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Contratado"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"delete": {
"tags": [
"Contratados"
],
"summary": "Delete Contratado",
"operationId": "delete_contratado_api_v1_contratados__contratado_id__delete",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contratado_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contratado Id"
}
}
],
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/": {
"post": {
"tags": [
"Contratos"
],
"summary": "Create Contrato",
"description": "Cria um novo contrato. Aceita dados de formulário e múltiplos ficheiros opcionais.\nRequer permissão de administrador.\n\nLimites de upload:\n- Máximo 10 arquivos por upload\n- 100MB por arquivo individual\n- 250MB total",
"operationId": "create_contrato_api_v1_contratos__post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"requestBody": {
"required": true,
"content": {
"multipart/form-data": {
"schema": {
"$ref": "#/components/schemas/Body_create_contrato_api_v1_contratos__post"
}
}
}
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Contrato"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"get": {
"tags": [
"Contratos"
],
"summary": "List Contratos",
"operationId": "list_contratos_api_v1_contratos__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "page",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"minimum": 1,
"description": "Número da página",
"default": 1,
"title": "Page"
},
"description": "Número da página"
},
{
"name": "per_page",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"maximum": 100,
"minimum": 1,
"description": "Itens por página",
"default": 10,
"title": "Per Page"
},
"description": "Itens por página"
},
{
"name": "gestor_id",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Gestor Id"
}
},
{
"name": "fiscal_id",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Fiscal Id"
}
},
{
"name": "objeto",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Objeto"
}
},
{
"name": "nr_contrato",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Nr Contrato"
}
},
{
"name": "status_id",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Status Id"
}
},
{
"name": "pae",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Pae"
}
},
{
"name": "ano",
"in": "query",
"required": false,
"schema": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Ano"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ContratoPaginated"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}": {
"get": {
"tags": [
"Contratos"
],
"summary": "Get Contrato By Id",
"operationId": "get_contrato_by_id_api_v1_contratos__contrato_id__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Contrato"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"patch": {
"tags": [
"Contratos"
],
"summary": "Update Contrato",
"description": "Atualiza um contrato existente. Aceita dados de formulário e múltiplos ficheiros opcionais.\nRequer permissão de administrador.\n\n- **contrato_id**: ID do contrato a ser atualizado\n- **nr_contrato**: Número do contrato (pode ser alterado)\n- **documento_contrato**: Arquivos opcionais para adicionar ao contrato\n- **outros campos**: Campos opcionais do contrato para atualização\n\nLimites de upload:\n- Máximo 10 arquivos por upload\n- 100MB por arquivo individual\n- 250MB total\n\nTodos os campos são opcionais - apenas os fornecidos serão atualizados.\n**ATENÇÃO**: Alterar o número do contrato pode impactar relatórios e histórico.",
"operationId": "update_contrato_api_v1_contratos__contrato_id__patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"requestBody": {
"content": {
"multipart/form-data": {
"schema": {
"$ref": "#/components/schemas/Body_update_contrato_api_v1_contratos__contrato_id__patch"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Contrato"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"delete": {
"tags": [
"Contratos"
],
"summary": "Delete Contrato",
"operationId": "delete_contrato_api_v1_contratos__contrato_id__delete",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/arquivos": {
"get": {
"tags": [
"Contratos"
],
"summary": "Listar arquivos do contrato",
"description": "Lista todos os arquivos de um contrato específico.\n\n- **contrato_id**: ID do contrato\n\nRetorna uma lista com todos os arquivos associados ao contrato,\nincluindo informações como nome, tipo, tamanho e data de criação.",
"operationId": "listar_arquivos_contrato_api_v1_contratos__contrato_id__arquivos_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ArquivoContratoList"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/arquivos/{arquivo_id}/download": {
"get": {
"tags": [
"Contratos"
],
"summary": "Download de arquivo do contrato",
"description": "Download de um arquivo específico de um contrato.\n\n- **contrato_id**: ID do contrato\n- **arquivo_id**: ID do arquivo a ser baixado\n\nRetorna o arquivo para download com o nome original e tipo MIME correto.",
"operationId": "download_arquivo_contrato_api_v1_contratos__contrato_id__arquivos__arquivo_id__download_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
},
{
"name": "arquivo_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Arquivo Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/arquivos/{arquivo_id}": {
"delete": {
"tags": [
"Contratos"
],
"summary": "Excluir arquivo do contrato",
"description": "Remove um arquivo específico de um contrato.\n\n- **contrato_id**: ID do contrato\n- **arquivo_id**: ID do arquivo a ser removido\n\n**Atenção**: Esta operação remove permanentemente o arquivo tanto do banco\nde dados quanto do sistema de arquivos. Requer permissão de administrador.",
"operationId": "excluir_arquivo_contrato_api_v1_contratos__contrato_id__arquivos__arquivo_id__delete",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
},
{
"name": "arquivo_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Arquivo Id"
}
}
],
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/pendencias/": {
"post": {
"tags": [
"Pendências"
],
"summary": "Create Pendencia",
"description": "Cria uma nova pendência para um contrato. Requer permissão de administrador.",
"operationId": "create_pendencia_api_v1_contratos__contrato_id__pendencias__post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/PendenciaCreate"
}
}
}
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Pendencia"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"get": {
"tags": [
"Pendências"
],
"summary": "List Pendencias",
"operationId": "list_pendencias_api_v1_contratos__contrato_id__pendencias__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/Pendencia"
},
"title": "Response List Pendencias Api V1 Contratos  Contrato Id  Pendencias  Get"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/pendencias/{pendencia_id}/cancelar": {
"patch": {
"tags": [
"Pendências"
],
"summary": "Cancelar Pendencia",
"description": "Cancela uma pendência específica. Requer permissão de administrador.\n\n- **contrato_id**: ID do contrato\n- **pendencia_id**: ID da pendência a ser cancelada\n\nAo cancelar, o fiscal será notificado por email e não precisará mais\nenviar relatório para esta pendência.",
"operationId": "cancelar_pendencia_api_v1_contratos__contrato_id__pendencias__pendencia_id__cancelar_patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
},
{
"name": "pendencia_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Pendencia Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Pendencia"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/pendencias/contador": {
"get": {
"tags": [
"Pendências"
],
"summary": "Contador de pendências por status",
"description": "Retorna contador de pendências por status para o dashboard.\n\n- **contrato_id**: ID do contrato\n\nRetorna quantidades separadas por status (pendente, análise, concluída, cancelada)\npara exibir badges no frontend como \"Pendências(2)\".",
"operationId": "contador_pendencias_api_v1_contratos__contrato_id__pendencias_contador_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/relatorios/": {
"post": {
"tags": [
"Relatórios Fiscais"
],
"summary": "Submit Relatorio",
"description": "Submete um novo relatório fiscal para um contrato, respondendo a uma pendência.",
"operationId": "submit_relatorio_api_v1_contratos__contrato_id__relatorios__post",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"multipart/form-data": {
"schema": {
"$ref": "#/components/schemas/Body_submit_relatorio_api_v1_contratos__contrato_id__relatorios__post"
}
}
}
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Relatorio"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"get": {
"tags": [
"Relatórios Fiscais"
],
"summary": "List Relatorios",
"operationId": "list_relatorios_api_v1_contratos__contrato_id__relatorios__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/Relatorio"
},
"title": "Response List Relatorios Api V1 Contratos  Contrato Id  Relatorios  Get"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/contratos/{contrato_id}/relatorios/{relatorio_id}/analise": {
"patch": {
"tags": [
"Relatórios Fiscais"
],
"summary": "Analisar Relatorio",
"description": "Aprova ou rejeita um relatório. Requer permissão de administrador.",
"operationId": "analisar_relatorio_api_v1_contratos__contrato_id__relatorios__relatorio_id__analise_patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
},
{
"name": "relatorio_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Relatorio Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/RelatorioAnalise"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Relatorio"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/arquivos/{arquivo_id}/download": {
"get": {
"tags": [
"Arquivos"
],
"summary": "Download Arquivo",
"description": "Fornece um arquivo para download.\n\nVerifica se o usuário logado tem permissão para acessar o contrato\nao qual o arquivo pertence (seja como admin, gestor ou fiscal).",
"operationId": "download_arquivo_api_v1_arquivos__arquivo_id__download_get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "arquivo_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Arquivo Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/arquivos/relatorios/contrato/{contrato_id}": {
"get": {
"tags": [
"Arquivos"
],
"summary": "List Arquivos Relatorios",
"description": "Lista todos os arquivos de relatórios de um contrato específico.\n\nRetorna somente arquivos que foram enviados como relatórios fiscais,\nseparados dos arquivos contratuais.",
"operationId": "list_arquivos_relatorios_api_v1_arquivos_relatorios_contrato__contrato_id__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "contrato_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Contrato Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/perfis/": {
"get": {
"tags": [
"Perfis"
],
"summary": "Get All Perfis",
"operationId": "get_all_perfis_api_v1_perfis__get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/Perfil"
},
"type": "array",
"title": "Response Get All Perfis Api V1 Perfis  Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
},
"post": {
"tags": [
"Perfis"
],
"summary": "Create Perfil",
"operationId": "create_perfil_api_v1_perfis__post",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/PerfilCreate"
}
}
},
"required": true
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Perfil"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/modalidades/": {
"get": {
"tags": [
"Modalidades"
],
"summary": "Get All Modalidades",
"operationId": "get_all_modalidades_api_v1_modalidades__get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/Modalidade"
},
"type": "array",
"title": "Response Get All Modalidades Api V1 Modalidades  Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
},
"post": {
"tags": [
"Modalidades"
],
"summary": "Create Modalidade",
"operationId": "create_modalidade_api_v1_modalidades__post",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ModalidadeCreate"
}
}
},
"required": true
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Modalidade"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/modalidades/{modalidade_id}": {
"patch": {
"tags": [
"Modalidades"
],
"summary": "Update Modalidade",
"operationId": "update_modalidade_api_v1_modalidades__modalidade_id__patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "modalidade_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Modalidade Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ModalidadeUpdate"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Modalidade"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"delete": {
"tags": [
"Modalidades"
],
"summary": "Delete Modalidade",
"operationId": "delete_modalidade_api_v1_modalidades__modalidade_id__delete",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "modalidade_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Modalidade Id"
}
}
],
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/status/": {
"get": {
"tags": [
"Status de Contratos"
],
"summary": "Get All Status",
"operationId": "get_all_status_api_v1_status__get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/Status"
},
"type": "array",
"title": "Response Get All Status Api V1 Status  Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
},
"post": {
"tags": [
"Status de Contratos"
],
"summary": "Create Status",
"operationId": "create_status_api_v1_status__post",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/StatusCreate"
}
}
},
"required": true
},
"responses": {
"201": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Status"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/status/{status_id}": {
"patch": {
"tags": [
"Status de Contratos"
],
"summary": "Update Status",
"operationId": "update_status_api_v1_status__status_id__patch",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "status_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Status Id"
}
}
],
"requestBody": {
"required": true,
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/StatusUpdate"
}
}
}
},
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Status"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
},
"delete": {
"tags": [
"Status de Contratos"
],
"summary": "Delete Status",
"operationId": "delete_status_api_v1_status__status_id__delete",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "status_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Status Id"
}
}
],
"responses": {
"204": {
"description": "Successful Response"
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/statusrelatorio/": {
"get": {
"tags": [
"Status de Relatórios"
],
"summary": "Get All Status Relatorio",
"description": "Lista todos os status de relatório disponíveis no sistema.",
"operationId": "get_all_status_relatorio_api_v1_statusrelatorio__get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/StatusRelatorio"
},
"type": "array",
"title": "Response Get All Status Relatorio Api V1 Statusrelatorio  Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/statusrelatorio/{status_id}": {
"get": {
"tags": [
"Status de Relatórios"
],
"summary": "Get Status Relatorio By Id",
"description": "Busca um status de relatório específico pelo ID.",
"operationId": "get_status_relatorio_by_id_api_v1_statusrelatorio__status_id__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "status_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Status Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/StatusRelatorio"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/api/v1/statuspendencia/": {
"get": {
"tags": [
"Status de Pendências"
],
"summary": "Get All Status Pendencia",
"description": "Lista todos os status de pendência disponíveis no sistema.",
"operationId": "get_all_status_pendencia_api_v1_statuspendencia__get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"items": {
"$ref": "#/components/schemas/StatusPendencia"
},
"type": "array",
"title": "Response Get All Status Pendencia Api V1 Statuspendencia  Get"
}
}
}
}
},
"security": [
{
"OAuth2PasswordBearer": []
}
]
}
},
"/api/v1/statuspendencia/{status_id}": {
"get": {
"tags": [
"Status de Pendências"
],
"summary": "Get Status Pendencia By Id",
"description": "Busca um status de pendência específico pelo ID.",
"operationId": "get_status_pendencia_by_id_api_v1_statuspendencia__status_id__get",
"security": [
{
"OAuth2PasswordBearer": []
}
],
"parameters": [
{
"name": "status_id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"title": "Status Id"
}
}
],
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/StatusPendencia"
}
}
}
},
"422": {
"description": "Validation Error",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/HTTPValidationError"
}
}
}
}
}
}
},
"/": {
"get": {
"tags": [
"Root"
],
"summary": "Read Root",
"description": "Endpoint raiz da API com informações básicas.",
"operationId": "read_root__get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
}
}
}
},
"/health": {
"get": {
"tags": [
"Health"
],
"summary": "Health Check",
"description": "Endpoint de health check para monitoramento.",
"operationId": "health_check_health_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
}
}
}
},
"/metrics": {
"get": {
"tags": [
"Monitoring"
],
"summary": "Get Metrics",
"description": "Endpoint básico de métricas para monitoramento.",
"operationId": "get_metrics_metrics_get",
"responses": {
"200": {
"description": "Successful Response",
"content": {
"application/json": {
"schema": {}
}
}
}
}
}
}
},
"components": {
"schemas": {
"AlternarPerfilRequest": {
"properties": {
"novo_perfil_id": {
"type": "integer",
"title": "Novo Perfil Id",
"description": "ID do perfil para alternar"
},
"justificativa": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Justificativa",
"description": "Motivo da alternância (opcional)"
}
},
"type": "object",
"required": [
"novo_perfil_id"
],
"title": "AlternarPerfilRequest",
"description": "Request para alternar perfil na sessão"
},
"ArquivoContrato": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"nome_arquivo": {
"type": "string",
"title": "Nome Arquivo"
},
"tipo_arquivo": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Tipo Arquivo"
},
"tamanho_bytes": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Tamanho Bytes"
},
"contrato_id": {
"type": "integer",
"title": "Contrato Id"
},
"created_at": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Created At"
}
},
"type": "object",
"required": [
"id",
"nome_arquivo",
"contrato_id"
],
"title": "ArquivoContrato",
"description": "Schema para representar um arquivo de contrato"
},
"ArquivoContratoList": {
"properties": {
"arquivos": {
"items": {
"$ref": "#/components/schemas/ArquivoContrato"
},
"type": "array",
"title": "Arquivos"
},
"total_arquivos": {
"type": "integer",
"title": "Total Arquivos"
},
"contrato_id": {
"type": "integer",
"title": "Contrato Id"
}
},
"type": "object",
"required": [
"arquivos",
"total_arquivos",
"contrato_id"
],
"title": "ArquivoContratoList",
"description": "Schema para listagem de arquivos de um contrato"
},
"Body_create_contrato_api_v1_contratos__post": {
"properties": {
"nr_contrato": {
"type": "string",
"title": "Nr Contrato"
},
"objeto": {
"type": "string",
"title": "Objeto"
},
"data_inicio": {
"type": "string",
"format": "date",
"title": "Data Inicio"
},
"data_fim": {
"type": "string",
"format": "date",
"title": "Data Fim"
},
"contratado_id": {
"type": "integer",
"title": "Contratado Id"
},
"modalidade_id": {
"type": "integer",
"title": "Modalidade Id"
},
"status_id": {
"type": "integer",
"title": "Status Id"
},
"gestor_id": {
"type": "integer",
"title": "Gestor Id"
},
"fiscal_id": {
"type": "integer",
"title": "Fiscal Id"
},
"valor_anual": {
"anyOf": [
{
"type": "number"
},
{
"type": "null"
}
],
"title": "Valor Anual"
},
"valor_global": {
"anyOf": [
{
"type": "number"
},
{
"type": "null"
}
],
"title": "Valor Global"
},
"base_legal": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Base Legal"
},
"termos_contratuais": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Termos Contratuais"
},
"fiscal_substituto_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Fiscal Substituto Id"
},
"pae": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Pae"
},
"doe": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Doe"
},
"data_doe": {
"anyOf": [
{
"type": "string",
"format": "date"
},
{
"type": "null"
}
],
"title": "Data Doe"
},
"documento_contrato": {
"items": {
"type": "string",
"format": "binary"
},
"type": "array",
"title": "Documento Contrato"
}
},
"type": "object",
"required": [
"nr_contrato",
"objeto",
"data_inicio",
"data_fim",
"contratado_id",
"modalidade_id",
"status_id",
"gestor_id",
"fiscal_id"
],
"title": "Body_create_contrato_api_v1_contratos__post"
},
"Body_login_for_access_token_auth_login_post": {
"properties": {
"grant_type": {
"anyOf": [
{
"type": "string",
"pattern": "^password$"
},
{
"type": "null"
}
],
"title": "Grant Type"
},
"username": {
"type": "string",
"title": "Username"
},
"password": {
"type": "string",
"format": "password",
"title": "Password"
},
"scope": {
"type": "string",
"title": "Scope",
"default": ""
},
"client_id": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Client Id"
},
"client_secret": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"format": "password",
"title": "Client Secret"
}
},
"type": "object",
"required": [
"username",
"password"
],
"title": "Body_login_for_access_token_auth_login_post"
},
"Body_login_legacy_auth_login_legacy_post": {
"properties": {
"grant_type": {
"anyOf": [
{
"type": "string",
"pattern": "^password$"
},
{
"type": "null"
}
],
"title": "Grant Type"
},
"username": {
"type": "string",
"title": "Username"
},
"password": {
"type": "string",
"format": "password",
"title": "Password"
},
"scope": {
"type": "string",
"title": "Scope",
"default": ""
},
"client_id": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Client Id"
},
"client_secret": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"format": "password",
"title": "Client Secret"
}
},
"type": "object",
"required": [
"username",
"password"
],
"title": "Body_login_legacy_auth_login_legacy_post"
},
"Body_submit_relatorio_api_v1_contratos__contrato_id__relatorios__post": {
"properties": {
"arquivo": {
"type": "string",
"format": "binary",
"title": "Arquivo"
},
"mes_competencia": {
"type": "string",
"format": "date",
"title": "Mes Competencia"
},
"observacoes_fiscal": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes Fiscal"
},
"pendencia_id": {
"type": "integer",
"title": "Pendencia Id"
}
},
"type": "object",
"required": [
"arquivo",
"mes_competencia",
"pendencia_id"
],
"title": "Body_submit_relatorio_api_v1_contratos__contrato_id__relatorios__post"
},
"Body_update_contrato_api_v1_contratos__contrato_id__patch": {
"properties": {
"nr_contrato": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Nr Contrato"
},
"objeto": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Objeto"
},
"data_inicio": {
"anyOf": [
{
"type": "string",
"format": "date"
},
{
"type": "null"
}
],
"title": "Data Inicio"
},
"data_fim": {
"anyOf": [
{
"type": "string",
"format": "date"
},
{
"type": "null"
}
],
"title": "Data Fim"
},
"contratado_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Contratado Id"
},
"modalidade_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Modalidade Id"
},
"status_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Status Id"
},
"gestor_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Gestor Id"
},
"fiscal_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Fiscal Id"
},
"valor_anual": {
"anyOf": [
{
"type": "number"
},
{
"type": "null"
}
],
"title": "Valor Anual"
},
"valor_global": {
"anyOf": [
{
"type": "number"
},
{
"type": "null"
}
],
"title": "Valor Global"
},
"base_legal": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Base Legal"
},
"termos_contratuais": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Termos Contratuais"
},
"fiscal_substituto_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Fiscal Substituto Id"
},
"pae": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Pae"
},
"doe": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Doe"
},
"data_doe": {
"anyOf": [
{
"type": "string",
"format": "date"
},
{
"type": "null"
}
],
"title": "Data Doe"
},
"documento_contrato": {
"items": {
"type": "string",
"format": "binary"
},
"type": "array",
"title": "Documento Contrato"
}
},
"type": "object",
"title": "Body_update_contrato_api_v1_contratos__contrato_id__patch"
},
"ContextoSessao": {
"properties": {
"usuario_id": {
"type": "integer",
"title": "Usuario Id"
},
"perfil_ativo_id": {
"type": "integer",
"title": "Perfil Ativo Id"
},
"perfil_ativo_nome": {
"type": "string",
"title": "Perfil Ativo Nome"
},
"perfis_disponiveis": {
"items": {
"$ref": "#/components/schemas/PerfilAtivo"
},
"type": "array",
"title": "Perfis Disponiveis"
},
"pode_alternar": {
"type": "boolean",
"title": "Pode Alternar",
"default": true
},
"sessao_id": {
"type": "string",
"title": "Sessao Id"
},
"data_ultima_alternancia": {
"anyOf": [
{
"type": "string",
"format": "date-time"
},
{
"type": "null"
}
],
"title": "Data Ultima Alternancia"
}
},
"type": "object",
"required": [
"usuario_id",
"perfil_ativo_id",
"perfil_ativo_nome",
"perfis_disponiveis",
"sessao_id"
],
"title": "ContextoSessao",
"description": "Contexto atual da sessão do usuário"
},
"Contratado": {
"properties": {
"nome": {
"type": "string",
"title": "Nome"
},
"email": {
"type": "string",
"format": "email",
"title": "Email"
},
"cnpj": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Cnpj"
},
"cpf": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Cpf"
},
"telefone": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Telefone"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
}
},
"type": "object",
"required": [
"nome",
"email",
"id",
"ativo"
],
"title": "Contratado"
},
"ContratadoCreate": {
"properties": {
"nome": {
"type": "string",
"title": "Nome"
},
"email": {
"type": "string",
"format": "email",
"title": "Email"
},
"cnpj": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Cnpj"
},
"cpf": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Cpf"
},
"telefone": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Telefone"
}
},
"type": "object",
"required": [
"nome",
"email"
],
"title": "ContratadoCreate"
},
"ContratadoPaginated": {
"properties": {
"data": {
"items": {
"$ref": "#/components/schemas/Contratado"
},
"type": "array",
"title": "Data"
},
"total_items": {
"type": "integer",
"title": "Total Items"
},
"total_pages": {
"type": "integer",
"title": "Total Pages"
},
"current_page": {
"type": "integer",
"title": "Current Page"
},
"per_page": {
"type": "integer",
"title": "Per Page"
}
},
"type": "object",
"required": [
"data",
"total_items",
"total_pages",
"current_page",
"per_page"
],
"title": "ContratadoPaginated"
},
"ContratadoUpdate": {
"properties": {
"nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Nome"
},
"email": {
"anyOf": [
{
"type": "string",
"format": "email"
},
{
"type": "null"
}
],
"title": "Email"
},
"cnpj": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Cnpj"
},
"cpf": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Cpf"
},
"telefone": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Telefone"
}
},
"type": "object",
"title": "ContratadoUpdate"
},
"Contrato": {
"properties": {
"nr_contrato": {
"type": "string",
"maxLength": 50,
"title": "Nr Contrato"
},
"objeto": {
"type": "string",
"title": "Objeto"
},
"data_inicio": {
"type": "string",
"format": "date",
"title": "Data Inicio"
},
"data_fim": {
"type": "string",
"format": "date",
"title": "Data Fim"
},
"contratado_id": {
"type": "integer",
"title": "Contratado Id"
},
"modalidade_id": {
"type": "integer",
"title": "Modalidade Id"
},
"status_id": {
"type": "integer",
"title": "Status Id"
},
"gestor_id": {
"type": "integer",
"title": "Gestor Id"
},
"fiscal_id": {
"type": "integer",
"title": "Fiscal Id"
},
"valor_anual": {
"anyOf": [
{
"type": "number"
},
{
"type": "null"
}
],
"title": "Valor Anual"
},
"valor_global": {
"anyOf": [
{
"type": "number"
},
{
"type": "null"
}
],
"title": "Valor Global"
},
"base_legal": {
"anyOf": [
{
"type": "string",
"maxLength": 255
},
{
"type": "null"
}
],
"title": "Base Legal"
},
"termos_contratuais": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Termos Contratuais"
},
"fiscal_substituto_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Fiscal Substituto Id"
},
"pae": {
"anyOf": [
{
"type": "string",
"maxLength": 50
},
{
"type": "null"
}
],
"title": "Pae"
},
"doe": {
"anyOf": [
{
"type": "string",
"maxLength": 50
},
{
"type": "null"
}
],
"title": "Doe"
},
"data_doe": {
"anyOf": [
{
"type": "string",
"format": "date"
},
{
"type": "null"
}
],
"title": "Data Doe"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
},
"contratado_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Contratado Nome"
},
"modalidade_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Modalidade Nome"
},
"status_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Status Nome"
},
"gestor_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Gestor Nome"
},
"fiscal_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Fiscal Nome"
},
"fiscal_substituto_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Fiscal Substituto Nome"
},
"documento_nome_arquivo": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Documento Nome Arquivo"
}
},
"type": "object",
"required": [
"nr_contrato",
"objeto",
"data_inicio",
"data_fim",
"contratado_id",
"modalidade_id",
"status_id",
"gestor_id",
"fiscal_id",
"id",
"ativo"
],
"title": "Contrato"
},
"ContratoList": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"nr_contrato": {
"type": "string",
"title": "Nr Contrato"
},
"objeto": {
"type": "string",
"title": "Objeto"
},
"data_fim": {
"type": "string",
"format": "date",
"title": "Data Fim"
},
"contratado_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Contratado Nome"
},
"status_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Status Nome"
}
},
"type": "object",
"required": [
"id",
"nr_contrato",
"objeto",
"data_fim"
],
"title": "ContratoList"
},
"ContratoPaginated": {
"properties": {
"data": {
"items": {
"$ref": "#/components/schemas/ContratoList"
},
"type": "array",
"title": "Data"
},
"total_items": {
"type": "integer",
"title": "Total Items"
},
"total_pages": {
"type": "integer",
"title": "Total Pages"
},
"current_page": {
"type": "integer",
"title": "Current Page"
},
"per_page": {
"type": "integer",
"title": "Per Page"
}
},
"type": "object",
"required": [
"data",
"total_items",
"total_pages",
"current_page",
"per_page"
],
"title": "ContratoPaginated"
},
"DashboardData": {
"properties": {
"perfil_ativo": {
"type": "string",
"title": "Perfil Ativo"
},
"widgets_disponiveis": {
"items": {
"type": "string"
},
"type": "array",
"title": "Widgets Disponiveis"
},
"menus_disponiveis": {
"items": {
"additionalProperties": true,
"type": "object"
},
"type": "array",
"title": "Menus Disponiveis"
},
"permissoes_ativas": {
"items": {
"type": "string"
},
"type": "array",
"title": "Permissoes Ativas"
},
"estatisticas": {
"additionalProperties": true,
"type": "object",
"title": "Estatisticas"
},
"notificacoes": {
"items": {
"additionalProperties": true,
"type": "object"
},
"type": "array",
"title": "Notificacoes"
}
},
"type": "object",
"required": [
"perfil_ativo",
"widgets_disponiveis",
"menus_disponiveis",
"permissoes_ativas",
"estatisticas"
],
"title": "DashboardData",
"description": "Dados do dashboard baseados no perfil ativo"
},
"HTTPValidationError": {
"properties": {
"detail": {
"items": {
"$ref": "#/components/schemas/ValidationError"
},
"type": "array",
"title": "Detail"
}
},
"type": "object",
"title": "HTTPValidationError"
},
"HistoricoPerfilConcessao": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"usuario_id": {
"type": "integer",
"title": "Usuario Id"
},
"perfil_id": {
"type": "integer",
"title": "Perfil Id"
},
"perfil_nome": {
"type": "string",
"title": "Perfil Nome"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
},
"data_concessao": {
"type": "string",
"format": "date-time",
"title": "Data Concessao"
},
"concedido_por_usuario_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Concedido Por Usuario Id"
},
"concedido_por_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Concedido Por Nome"
},
"observacoes": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes"
}
},
"type": "object",
"required": [
"id",
"usuario_id",
"perfil_id",
"perfil_nome",
"ativo",
"data_concessao"
],
"title": "HistoricoPerfilConcessao",
"description": "Schema para histórico de concessão/remoção de perfis"
},
"LoginComPerfilRequest": {
"properties": {
"email": {
"type": "string",
"title": "Email"
},
"senha": {
"type": "string",
"title": "Senha"
},
"perfil_inicial_id": {
"anyOf": [
{
"type": "integer"
},
{
"type": "null"
}
],
"title": "Perfil Inicial Id",
"description": "Perfil para iniciar sessão"
}
},
"type": "object",
"required": [
"email",
"senha"
],
"title": "LoginComPerfilRequest",
"description": "Request de login especificando perfil inicial"
},
"LoginResponse": {
"properties": {
"access_token": {
"type": "string",
"title": "Access Token"
},
"token_type": {
"type": "string",
"title": "Token Type",
"default": "bearer"
},
"contexto_sessao": {
"$ref": "#/components/schemas/ContextoSessao"
},
"requer_selecao_perfil": {
"type": "boolean",
"title": "Requer Selecao Perfil",
"default": false
},
"mensagem": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Mensagem"
}
},
"type": "object",
"required": [
"access_token",
"contexto_sessao"
],
"title": "LoginResponse",
"description": "Resposta do login com informações de contexto"
},
"Modalidade": {
"properties": {
"nome": {
"type": "string",
"maxLength": 100,
"minLength": 3,
"title": "Nome"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
}
},
"type": "object",
"required": [
"nome",
"id",
"ativo"
],
"title": "Modalidade"
},
"ModalidadeCreate": {
"properties": {
"nome": {
"type": "string",
"maxLength": 100,
"minLength": 3,
"title": "Nome"
}
},
"type": "object",
"required": [
"nome"
],
"title": "ModalidadeCreate"
},
"ModalidadeUpdate": {
"properties": {
"nome": {
"anyOf": [
{
"type": "string",
"maxLength": 100,
"minLength": 3
},
{
"type": "null"
}
],
"title": "Nome"
}
},
"type": "object",
"title": "ModalidadeUpdate"
},
"Pendencia": {
"properties": {
"descricao": {
"type": "string",
"title": "Descricao"
},
"data_prazo": {
"type": "string",
"format": "date",
"title": "Data Prazo"
},
"status_pendencia_id": {
"type": "integer",
"title": "Status Pendencia Id"
},
"criado_por_usuario_id": {
"type": "integer",
"title": "Criado Por Usuario Id"
},
"id": {
"type": "integer",
"title": "Id"
},
"contrato_id": {
"type": "integer",
"title": "Contrato Id"
},
"created_at": {
"type": "string",
"format": "date-time",
"title": "Created At"
},
"updated_at": {
"type": "string",
"format": "date-time",
"title": "Updated At"
},
"status_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Status Nome"
},
"criado_por_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Criado Por Nome"
}
},
"type": "object",
"required": [
"descricao",
"data_prazo",
"status_pendencia_id",
"criado_por_usuario_id",
"id",
"contrato_id",
"created_at",
"updated_at"
],
"title": "Pendencia"
},
"PendenciaCreate": {
"properties": {
"descricao": {
"type": "string",
"title": "Descricao"
},
"data_prazo": {
"type": "string",
"format": "date",
"title": "Data Prazo"
},
"status_pendencia_id": {
"type": "integer",
"title": "Status Pendencia Id"
},
"criado_por_usuario_id": {
"type": "integer",
"title": "Criado Por Usuario Id"
}
},
"type": "object",
"required": [
"descricao",
"data_prazo",
"status_pendencia_id",
"criado_por_usuario_id"
],
"title": "PendenciaCreate"
},
"Perfil": {
"properties": {
"nome": {
"type": "string",
"title": "Nome"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
}
},
"type": "object",
"required": [
"nome",
"id",
"ativo"
],
"title": "Perfil"
},
"PerfilAtivo": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"nome": {
"type": "string",
"title": "Nome"
},
"pode_ser_selecionado": {
"type": "boolean",
"title": "Pode Ser Selecionado",
"default": true
},
"descricao": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Descricao"
}
},
"type": "object",
"required": [
"id",
"nome"
],
"title": "PerfilAtivo",
"description": "Representação de um perfil ativo do usuário"
},
"PerfilCreate": {
"properties": {
"nome": {
"type": "string",
"title": "Nome"
}
},
"type": "object",
"required": [
"nome"
],
"title": "PerfilCreate"
},
"PerfilWithUsers": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"nome": {
"type": "string",
"title": "Nome"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
},
"usuarios": {
"items": {
"additionalProperties": true,
"type": "object"
},
"type": "array",
"title": "Usuarios",
"description": "Usuários com este perfil"
},
"total_usuarios": {
"type": "integer",
"title": "Total Usuarios",
"description": "Total de usuários com este perfil",
"default": 0
}
},
"type": "object",
"required": [
"id",
"nome",
"ativo"
],
"title": "PerfilWithUsers",
"description": "Schema para perfil com lista de usuários que o possuem"
},
"PermissaoContextual": {
"properties": {
"perfil_ativo": {
"type": "string",
"title": "Perfil Ativo"
},
"pode_criar_contrato": {
"type": "boolean",
"title": "Pode Criar Contrato",
"default": false
},
"pode_editar_contrato": {
"type": "boolean",
"title": "Pode Editar Contrato",
"default": false
},
"pode_criar_pendencia": {
"type": "boolean",
"title": "Pode Criar Pendencia",
"default": false
},
"pode_submeter_relatorio": {
"type": "boolean",
"title": "Pode Submeter Relatorio",
"default": false
},
"pode_aprovar_relatorio": {
"type": "boolean",
"title": "Pode Aprovar Relatorio",
"default": false
},
"pode_gerenciar_usuarios": {
"type": "boolean",
"title": "Pode Gerenciar Usuarios",
"default": false
},
"pode_ver_todos_contratos": {
"type": "boolean",
"title": "Pode Ver Todos Contratos",
"default": false
},
"contratos_visiveis": {
"items": {
"type": "integer"
},
"type": "array",
"title": "Contratos Visiveis"
},
"acoes_disponiveis": {
"items": {
"type": "string"
},
"type": "array",
"title": "Acoes Disponiveis"
}
},
"type": "object",
"required": [
"perfil_ativo"
],
"title": "PermissaoContextual",
"description": "Permissões baseadas no contexto atual"
},
"Relatorio": {
"properties": {
"mes_competencia": {
"type": "string",
"format": "date",
"title": "Mes Competencia"
},
"observacoes_fiscal": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes Fiscal"
},
"pendencia_id": {
"type": "integer",
"title": "Pendencia Id"
},
"id": {
"type": "integer",
"title": "Id"
},
"contrato_id": {
"type": "integer",
"title": "Contrato Id"
},
"fiscal_usuario_id": {
"type": "integer",
"title": "Fiscal Usuario Id"
},
"arquivo_id": {
"type": "integer",
"title": "Arquivo Id"
},
"status_id": {
"type": "integer",
"title": "Status Id"
},
"created_at": {
"type": "string",
"format": "date-time",
"title": "Created At"
},
"updated_at": {
"anyOf": [
{
"type": "string",
"format": "date-time"
},
{
"type": "null"
}
],
"title": "Updated At"
},
"enviado_por": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Enviado Por"
},
"status_relatorio": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Status Relatorio"
},
"nome_arquivo": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Nome Arquivo"
}
},
"type": "object",
"required": [
"mes_competencia",
"pendencia_id",
"id",
"contrato_id",
"fiscal_usuario_id",
"arquivo_id",
"status_id",
"created_at"
],
"title": "Relatorio"
},
"RelatorioAnalise": {
"properties": {
"aprovador_usuario_id": {
"type": "integer",
"title": "Aprovador Usuario Id"
},
"status_id": {
"type": "integer",
"title": "Status Id"
},
"observacoes_aprovador": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes Aprovador"
}
},
"type": "object",
"required": [
"aprovador_usuario_id",
"status_id"
],
"title": "RelatorioAnalise"
},
"Status": {
"properties": {
"nome": {
"type": "string",
"maxLength": 50,
"minLength": 3,
"title": "Nome"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
}
},
"type": "object",
"required": [
"nome",
"id",
"ativo"
],
"title": "Status"
},
"StatusCreate": {
"properties": {
"nome": {
"type": "string",
"maxLength": 50,
"minLength": 3,
"title": "Nome"
}
},
"type": "object",
"required": [
"nome"
],
"title": "StatusCreate"
},
"StatusPendencia": {
"properties": {
"nome": {
"type": "string",
"maxLength": 50,
"minLength": 3,
"title": "Nome"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
}
},
"type": "object",
"required": [
"nome",
"id",
"ativo"
],
"title": "StatusPendencia"
},
"StatusRelatorio": {
"properties": {
"nome": {
"type": "string",
"maxLength": 50,
"minLength": 3,
"title": "Nome"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
}
},
"type": "object",
"required": [
"nome",
"id",
"ativo"
],
"title": "StatusRelatorio"
},
"StatusUpdate": {
"properties": {
"nome": {
"anyOf": [
{
"type": "string",
"maxLength": 50,
"minLength": 3
},
{
"type": "null"
}
],
"title": "Nome"
}
},
"type": "object",
"title": "StatusUpdate"
},
"Token": {
"properties": {
"access_token": {
"type": "string",
"title": "Access Token"
},
"token_type": {
"type": "string",
"title": "Token Type"
}
},
"type": "object",
"required": [
"access_token",
"token_type"
],
"title": "Token"
},
"Usuario": {
"properties": {
"nome": {
"type": "string",
"maxLength": 255,
"minLength": 3,
"title": "Nome",
"description": "Nome completo do usuário"
},
"email": {
"type": "string",
"format": "email",
"title": "Email",
"description": "Email único do usuário"
},
"cpf": {
"type": "string",
"maxLength": 11,
"minLength": 11,
"title": "Cpf",
"description": "CPF sem formatação"
},
"matricula": {
"anyOf": [
{
"type": "string",
"maxLength": 20
},
{
"type": "null"
}
],
"title": "Matricula",
"description": "Matrícula do usuário"
},
"perfil_id": {
"type": "integer",
"exclusiveMinimum": 0,
"title": "Perfil Id",
"description": "ID do perfil do usuário"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo",
"default": true
},
"created_at": {
"anyOf": [
{
"type": "string",
"format": "date-time"
},
{
"type": "null"
}
],
"title": "Created At"
},
"updated_at": {
"anyOf": [
{
"type": "string",
"format": "date-time"
},
{
"type": "null"
}
],
"title": "Updated At"
}
},
"type": "object",
"required": [
"nome",
"email",
"cpf",
"perfil_id",
"id"
],
"title": "Usuario"
},
"UsuarioChangePassword": {
"properties": {
"senha_antiga": {
"type": "string",
"title": "Senha Antiga",
"description": "Senha atual do usuário"
},
"nova_senha": {
"type": "string",
"minLength": 6,
"title": "Nova Senha",
"description": "Nova senha"
}
},
"type": "object",
"required": [
"senha_antiga",
"nova_senha"
],
"title": "UsuarioChangePassword"
},
"UsuarioComPerfis": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"nome": {
"type": "string",
"title": "Nome"
},
"email": {
"type": "string",
"title": "Email"
},
"matricula": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Matricula"
},
"ativo": {
"type": "boolean",
"title": "Ativo"
},
"perfis": {
"items": {
"type": "string"
},
"type": "array",
"title": "Perfis",
"description": "Lista de nomes dos perfis"
},
"perfil_ids": {
"items": {
"type": "integer"
},
"type": "array",
"title": "Perfil Ids",
"description": "Lista de IDs dos perfis"
},
"perfis_texto": {
"type": "string",
"title": "Perfis Texto",
"description": "Perfis concatenados em texto",
"default": ""
}
},
"type": "object",
"required": [
"id",
"nome",
"email",
"ativo"
],
"title": "UsuarioComPerfis",
"description": "Schema para usuário com todos os seus perfis"
},
"UsuarioCreate": {
"properties": {
"nome": {
"type": "string",
"maxLength": 255,
"minLength": 3,
"title": "Nome",
"description": "Nome completo do usuário"
},
"email": {
"type": "string",
"format": "email",
"title": "Email",
"description": "Email único do usuário"
},
"cpf": {
"type": "string",
"maxLength": 11,
"minLength": 11,
"title": "Cpf",
"description": "CPF sem formatação"
},
"matricula": {
"anyOf": [
{
"type": "string",
"maxLength": 20
},
{
"type": "null"
}
],
"title": "Matricula",
"description": "Matrícula do usuário"
},
"perfil_id": {
"type": "integer",
"exclusiveMinimum": 0,
"title": "Perfil Id",
"description": "ID do perfil do usuário"
},
"senha": {
"type": "string",
"minLength": 6,
"title": "Senha",
"description": "Senha do usuário"
}
},
"type": "object",
"required": [
"nome",
"email",
"cpf",
"perfil_id",
"senha"
],
"title": "UsuarioCreate"
},
"UsuarioList": {
"properties": {
"id": {
"type": "integer",
"title": "Id"
},
"nome": {
"type": "string",
"title": "Nome"
},
"email": {
"type": "string",
"format": "email",
"title": "Email"
},
"matricula": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Matricula"
},
"perfil_nome": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Perfil Nome"
}
},
"type": "object",
"required": [
"id",
"nome",
"email"
],
"title": "UsuarioList",
"description": "Schema simplificado para listagem de usuários."
},
"UsuarioPaginated": {
"properties": {
"data": {
"items": {
"$ref": "#/components/schemas/UsuarioList"
},
"type": "array",
"title": "Data"
},
"total_items": {
"type": "integer",
"title": "Total Items"
},
"total_pages": {
"type": "integer",
"title": "Total Pages"
},
"current_page": {
"type": "integer",
"title": "Current Page"
},
"per_page": {
"type": "integer",
"title": "Per Page"
}
},
"type": "object",
"required": [
"data",
"total_items",
"total_pages",
"current_page",
"per_page"
],
"title": "UsuarioPaginated",
"description": "Schema para a resposta paginada de usuários."
},
"UsuarioPerfil": {
"properties": {
"usuario_id": {
"type": "integer",
"title": "Usuario Id",
"description": "ID do usuário"
},
"perfil_id": {
"type": "integer",
"title": "Perfil Id",
"description": "ID do perfil"
},
"id": {
"type": "integer",
"title": "Id"
},
"ativo": {
"type": "boolean",
"title": "Ativo",
"description": "Status ativo do perfil",
"default": true
},
"perfil_nome": {
"type": "string",
"title": "Perfil Nome"
},
"data_concessao": {
"type": "string",
"format": "date-time",
"title": "Data Concessao"
},
"observacoes": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes"
}
},
"type": "object",
"required": [
"usuario_id",
"perfil_id",
"id",
"perfil_nome",
"data_concessao"
],
"title": "UsuarioPerfil"
},
"UsuarioPerfilGrantRequest": {
"properties": {
"perfil_ids": {
"items": {
"type": "integer"
},
"type": "array",
"title": "Perfil Ids",
"description": "Lista de IDs dos perfis a conceder"
},
"observacoes": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes",
"description": "Justificativa para concessão dos perfis"
}
},
"type": "object",
"required": [
"perfil_ids"
],
"title": "UsuarioPerfilGrantRequest"
},
"UsuarioPerfilRevokeRequest": {
"properties": {
"perfil_ids": {
"items": {
"type": "integer"
},
"type": "array",
"title": "Perfil Ids",
"description": "Lista de IDs dos perfis a revogar"
}
},
"type": "object",
"required": [
"perfil_ids"
],
"title": "UsuarioPerfilRevokeRequest"
},
"UsuarioResetPassword": {
"properties": {
"nova_senha": {
"type": "string",
"minLength": 6,
"title": "Nova Senha",
"description": "Nova senha para o usuário"
}
},
"type": "object",
"required": [
"nova_senha"
],
"title": "UsuarioResetPassword"
},
"UsuarioUpdate": {
"properties": {
"nome": {
"anyOf": [
{
"type": "string",
"maxLength": 255,
"minLength": 3
},
{
"type": "null"
}
],
"title": "Nome"
},
"email": {
"anyOf": [
{
"type": "string",
"format": "email"
},
{
"type": "null"
}
],
"title": "Email"
},
"cpf": {
"anyOf": [
{
"type": "string",
"maxLength": 11,
"minLength": 11
},
{
"type": "null"
}
],
"title": "Cpf"
},
"matricula": {
"anyOf": [
{
"type": "string",
"maxLength": 20
},
{
"type": "null"
}
],
"title": "Matricula"
},
"perfil_id": {
"anyOf": [
{
"type": "integer",
"exclusiveMinimum": 0
},
{
"type": "null"
}
],
"title": "Perfil Id"
},
"senha": {
"anyOf": [
{
"type": "string",
"minLength": 6
},
{
"type": "null"
}
],
"title": "Senha"
}
},
"type": "object",
"title": "UsuarioUpdate"
},
"ValidacaoPerfil": {
"properties": {
"usuario_id": {
"type": "integer",
"title": "Usuario Id"
},
"pode_ser_fiscal": {
"type": "boolean",
"title": "Pode Ser Fiscal"
},
"pode_ser_gestor": {
"type": "boolean",
"title": "Pode Ser Gestor"
},
"pode_ser_admin": {
"type": "boolean",
"title": "Pode Ser Admin"
},
"perfis_ativos": {
"items": {
"type": "string"
},
"type": "array",
"title": "Perfis Ativos"
},
"observacoes": {
"anyOf": [
{
"type": "string"
},
{
"type": "null"
}
],
"title": "Observacoes"
}
},
"type": "object",
"required": [
"usuario_id",
"pode_ser_fiscal",
"pode_ser_gestor",
"pode_ser_admin",
"perfis_ativos"
],
"title": "ValidacaoPerfil",
"description": "Schema para resposta de validação de perfis"
},
"ValidationError": {
"properties": {
"loc": {
"items": {
"anyOf": [
{
"type": "string"
},
{
"type": "integer"
}
]
},
"type": "array",
"title": "Location"
},
"msg": {
"type": "string",
"title": "Message"
},
"type": {
"type": "string",
"title": "Error Type"
}
},
"type": "object",
"required": [
"loc",
"msg",
"type"
],
"title": "ValidationError"
}
},
"securitySchemes": {
"OAuth2PasswordBearer": {
"type": "oauth2",
"flows": {
"password": {
"scopes": {},
"tokenUrl": "/auth/login"
}
}
}
}
}
}