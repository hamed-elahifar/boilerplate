import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RolesEnum } from './enums/roles.enum';

/** The user record: what signs in, and what `/users` manages. */
@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    // `select: false` keeps the hash out of queries, but a freshly saved
    // document still holds it; stripping at serialization closes that path.
    transform: (_document, serialized: Record<string, unknown>) => {
      delete serialized.password;
      return serialized;
    },
  },
})
export class AuthEntity extends Document {
  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  username: string;

  @Prop({ trim: true, unique: true, sparse: true })
  phone?: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export type AuthDocument = AuthEntity;

export const AuthEntitySchema = SchemaFactory.createForClass(AuthEntity);
