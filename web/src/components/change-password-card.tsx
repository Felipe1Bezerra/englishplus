import { changePassword } from "@/app/actions/auth";
import { ActionForm, SubmitButton } from "./action-form";
import { Card, Field } from "./ui";

export function ChangePasswordCard() {
  return (
    <Card title="Alterar senha" className="max-w-md">
      <ActionForm action={changePassword} successMessage="Senha alterada." className="space-y-4">
        <Field
          label="Senha atual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <Field
          label="Nova senha"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          hint="Pelo menos 8 caracteres."
          required
        />
        <SubmitButton>Salvar nova senha</SubmitButton>
      </ActionForm>
    </Card>
  );
}
