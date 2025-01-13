import { type Resource } from "@/schemas/resourceSchema"
import { capitalize } from "./capitalize"

const baseUp = `DECLARE @LanguageIdBR INT;
DECLARE @LanguageIdARG INT;

DECLARE @ResourceGroupId INT;
DECLARE @ResourceGroupName VARCHAR(100);
DECLARE @ResourceGroupDescription NVARCHAR(MAX);

DECLARE @ResourceId INT;
DECLARE @ResourceKey VARCHAR(100);
DECLARE @ResourceDescription NVARCHAR(MAX);

DECLARE @TextValueBR NVARCHAR(MAX);
DECLARE @TextValueARG NVARCHAR(MAX);

SET @LanguageIdBR = (SELECT [LanguageId] FROM [ACS].[IIS].[Language] WHERE [CultureCode] = 'pt-br')
SET @LanguageIdARG = (SELECT [LanguageId] FROM [ACS].[IIS].[Language] WHERE [CultureCode] = 'es-ar')
`

const baseDown = `${baseUp}`

export const generateSql = ({
  name,
  description,
  keys,
}: Omit<Resource, "fileName">): { up: string; down: string } => {
  let up = `${baseUp}
`
  let down = `${baseDown}
DECLARE @Id INT;
`

  const parsedGroupName = capitalize(name).replace(/ /g, "")
  const parsedDescription = capitalize(description).trim()

  up += `SET @ResourceGroupName = '${parsedGroupName}'
SET @ResourceDescription = '${parsedDescription}'
IF NOT EXISTS (SELECT 1 FROM [IIS].[ResourceGroup] WHERE [Name] = LTRIM(RTRIM(@ResourceGroupName)))
BEGIN
    INSERT INTO [IIS].[ResourceGroup] ([Name],[Description],[Origin],[System])
    VALUES (LTRIM(RTRIM(@ResourceGroupName)),LTRIM(RTRIM(@ResourceDescription)),'Angular' ,'CSOnline')
END
SET @ResourceGroupId = (SELECT [ResourceGroupId] FROM [ACS].[IIS].[ResourceGroup] WHERE [Name] = LTRIM(RTRIM(@ResourceGroupName)))`

  down += `
SET @ResourceGroupId = (SELECT [ResourceGroupId] FROM [ACS].[IIS].[ResourceGroup] WHERE [Name] = '${parsedGroupName}')
`

  for (const { name, description, ptBR, es } of keys) {
    const parsedKeyName = `.${capitalize(name).replace(/ /g, "")}`
    const parsedDescription = capitalize(description).trim()

    up += `

IF @ResourceGroupId is not null
BEGIN
    SET @ResourceKey = LTRIM(RTRIM(@ResourceGroupName)) + '${parsedKeyName}'
    SET @ResourceId = (SELECT [ResourceId] FROM [ACS].[IIS].[Resource] WHERE [ResourceKey] = LTRIM(RTRIM(@ResourceKey)))
    SET @ResourceDescription = '${parsedDescription}'
    SET @TextValueBR = '${ptBR}'
    SET @TextValueARG = '${es}'
    IF @ResourceId is null
    BEGIN
        INSERT INTO [ACS].[IIS].[Resource] ([ResourceGroupId], [ResourceKey], [Description]) VALUES (@ResourceGroupId,LTRIM(RTRIM(@ResourceKey)),@ResourceDescription)
        SET @ResourceId = (SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY])
        INSERT INTO [ACS].[IIS].[LocalizedResource] ([ResourceId],[LanguageId], [TextValue]) VALUES (@ResourceId,@LanguageIdBR,LTRIM(RTRIM(@TextValueBR)))
        INSERT INTO [ACS].[IIS].[LocalizedResource] ([ResourceId],[LanguageId], [TextValue]) VALUES (@ResourceId,@LanguageIdARG,LTRIM(RTRIM(@TextValueARG)))
    END
    ELSE
    BEGIN
        SET @ResourceGroupId = (SELECT [ResourceGroupId] FROM [ACS].[IIS].[ResourceGroup] WHERE [Name] = LTRIM(RTRIM(@ResourceGroupName)))
        UPDATE [ACS].[IIS].[LocalizedResource] SET [TextValue] = LTRIM(RTRIM(@TextValueBR)) WHERE [ResourceId] = @ResourceId AND [LanguageId] = @LanguageIdBR;
        UPDATE [ACS].[IIS].[LocalizedResource] SET [TextValue] = LTRIM(RTRIM(@TextValueARG)) WHERE [ResourceId] = @ResourceId AND [LanguageId] = @LanguageIdARG;
    END
END`

    down += `
IF @ResourceGroupId is not null
BEGIN
    IF exists (SELECT 1 FROM [ACS].[IIS].[Resource] WHERE [ResourceKey] = '${parsedGroupName}${parsedKeyName}' AND [ResourceGroupId] = @ResourceGroupId) 
    BEGIN
        SET @Id = (SELECT MAX([ResourceId]) FROM [ACS].[IIS].[Resource] WHERE [ResourceKey] = '${parsedGroupName}${parsedKeyName}' and [ResourceGroupId] = @ResourceGroupId)
        DELETE [ACS].[IIS].[LocalizedResource] WHERE [ResourceId] = @Id
        DELETE [ACS].[IIS].[Resource] WHERE [ResourceId] = @Id
    END
END`
  }

  return {
    up,
    down,
  }
}
