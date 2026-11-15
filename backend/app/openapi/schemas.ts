import { TASK_STATUSES } from '#models/task'
import { ApiProperty } from '@foadonis/openapi/decorators'

/**
 * Los objetos que la API de tareas intercambia, descritos una sola vez. El
 * generador publica cada clase usada en `components.schemas` con el nombre de
 * la clase, y las respuestas la referencian por `$ref` en lugar de repetirla.
 *
 * Esto solo describe lo que los transformers y validadores ya producen: no
 * los sustituye ni los valida. Si uno cambia, su clase de aquí cambia con él.
 */

/** `TaskAssigneeTransformer`: lo justo para identificar a quien lleva la tarea. */
export class Assignee {
  @ApiProperty({ type: Number })
  declare id: number

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Nulo si la cuenta se registró sin nombre',
  })
  declare fullName: string | null

  @ApiProperty({ type: String, example: 'AL' })
  declare initials: string
}

/** `TaskTransformer`: lo que devuelven la lista, el alta y el cambio de estado. */
export class Task {
  @ApiProperty({ type: Number })
  declare id: number

  @ApiProperty({ type: String })
  declare title: string

  @ApiProperty({ type: String, enum: [...TASK_STATUSES] })
  declare status: string

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  declare createdAt: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  declare updatedAt: string | null

  @ApiProperty({ type: () => Assignee })
  declare assignee: Assignee
}

/** `TaskDetailTransformer`: la tarea suelta, la única que informa del vencimiento. */
export class TaskDetail extends Task {
  @ApiProperty({
    type: String,
    format: 'date',
    nullable: true,
    description: 'Un día del calendario (AAAA-MM-DD), sin hora ni huso. Nulo si no tiene fecha',
  })
  declare dueDate: string | null

  @ApiProperty({
    type: Boolean,
    description: 'Resuelta contra el día de referencia `today` indicado por quien consulta',
  })
  declare isOverdue: boolean
}

/** Envoltorios `{ data }` del serializer de `providers/api_provider.ts`. */
export class TaskResponse {
  @ApiProperty({ type: () => Task })
  declare data: Task
}

export class TaskListResponse {
  @ApiProperty({ type: () => [Task] })
  declare data: Task[]
}

export class TaskDetailResponse {
  @ApiProperty({ type: () => TaskDetail })
  declare data: TaskDetail
}

/** Cuerpos de petición, tal y como los validan `validators/task.ts`. */
export class CreateTaskBody {
  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 200,
    description: 'Se recortan los espacios de los extremos antes de validar la longitud',
  })
  declare title: string
}

export class UpdateTaskStatusBody {
  @ApiProperty({ type: String, enum: [...TASK_STATUSES] })
  declare status: string
}

export class SetTaskDueDateBody {
  @ApiProperty({
    type: String,
    format: 'date',
    description: 'Día de referencia de quien mira (AAAA-MM-DD)',
  })
  declare today: string

  @ApiProperty({
    type: String,
    format: 'date',
    nullable: true,
    description: 'AAAA-MM-DD, o null para retirar la fecha',
  })
  declare dueDate: string | null
}

/** Errores. */
export class ValidationErrorItem {
  @ApiProperty({ type: String })
  declare message: string

  @ApiProperty({ type: String, example: 'required' })
  declare rule: string

  @ApiProperty({ type: String, example: 'title' })
  declare field: string
}

export class ValidationErrorResponse {
  @ApiProperty({ type: () => [ValidationErrorItem] })
  declare errors: ValidationErrorItem[]
}

export class UnauthorizedItem {
  @ApiProperty({ type: String, example: 'Unauthorized access' })
  declare message: string
}

export class UnauthorizedResponse {
  @ApiProperty({ type: () => [UnauthorizedItem] })
  declare errors: UnauthorizedItem[]
}

export class NotFoundResponse {
  @ApiProperty({ type: String, example: 'Row not found' })
  declare message: string

  @ApiProperty({ type: String, example: 'E_ROW_NOT_FOUND' })
  declare code: string
}
