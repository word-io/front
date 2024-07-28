interface HintProps {
  hint: string;
}

export const Hint = ({ hint }: HintProps) => (
  <div className="bg-muted rounded-lg p-4">
    <h3 className="text-lg font-bold uppercase">Dica</h3>
    <p className="text-primary">{hint || "Aguarde a definição..."}</p>
  </div>
);
