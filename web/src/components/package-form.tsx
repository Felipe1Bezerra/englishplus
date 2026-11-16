import { savePackage } from "@/app/actions/admin";
import type { AdminCourse, AdminPackage } from "@/lib/api";
import { centsToInput } from "@/lib/format";
import { ActionForm, SubmitButton } from "./action-form";
import { Card, Checkbox, Field, Select, TextArea } from "./ui";

export function PackageForm({
  item,
  courses,
}: {
  item?: AdminPackage;
  courses: AdminCourse[];
}) {
  return (
    <ActionForm
      action={savePackage.bind(null, item?.id ?? null)}
      successMessage="Pacote salvo."
      className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]"
    >
      <Card title="Dados do pacote">
        <div className="space-y-4">
          <Field label="Nome" name="name" defaultValue={item?.name} required />
          <Field
            label="Endereço"
            name="slug"
            defaultValue={item?.slug}
            hint="Aparece no link de compra, como /assinar/em-grupo."
            pattern="[a-z0-9\-]+"
            required
          />
          <Select label="Tipo" name="kind" defaultValue={item?.kind ?? "platform"}>
            <option value="individual">Individual</option>
            <option value="group">Em grupo</option>
            <option value="platform">Plataforma</option>
          </Select>
          <Field
            label="Frequência"
            name="cadence"
            defaultValue={item?.cadence}
            placeholder="2 aulas por semana"
            required
          />
          <TextArea
            label="Descrição"
            name="description"
            rows={2}
            defaultValue={item?.description}
            required
          />
          <TextArea
            label="Benefícios"
            name="features"
            rows={5}
            defaultValue={item?.features.join("\n")}
            hint="Um por linha."
            required
          />
        </div>
      </Card>

      <div className="space-y-6">
        <Card title="Preços">
          <div className="space-y-4">
            <Field
              label="Mensal (R$)"
              name="monthly"
              inputMode="decimal"
              defaultValue={item ? centsToInput(item.monthlyCents) : ""}
              placeholder="49,90"
              required
            />
            <Field
              label="Anual (R$)"
              name="yearly"
              inputMode="decimal"
              defaultValue={item ? centsToInput(item.yearlyCents) : ""}
              hint="Quem já assinou continua pagando o preço da compra."
              placeholder="499,00"
              required
            />
            <Field
              label="Ordem na página"
              name="sortOrder"
              type="number"
              defaultValue={item?.sortOrder ?? 0}
            />
            <Checkbox label="À venda" name="active" defaultChecked={item?.active ?? true} />
          </div>
        </Card>

        <Card title="Cursos incluídos">
          <div className="space-y-3">
            {courses.map((course) => (
              <Checkbox
                key={course.id}
                label={course.title}
                name="courseIds"
                value={course.id}
                defaultChecked={item?.courseIds.includes(course.id)}
              />
            ))}
          </div>
        </Card>

        <SubmitButton className="w-full">Salvar pacote</SubmitButton>
      </div>
    </ActionForm>
  );
}
