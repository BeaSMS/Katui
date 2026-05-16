package com.katui.service;

import com.katui.entity.Alarme;
import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.repository.AlarmeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlarmeService {

    private final AlarmeRepository repository;

    // Gera alarmes automaticamente a partir do medicamento
    public List<Alarme> gerarAlarmes(Medicamento medicamento, Usuario usuario) {

        List<Alarme> alarmes = new ArrayList<>();

        // Deleta alarmes anteriores do medicamento se existirem
        repository.deleteAll(
                repository.findByMedicamento(medicamento)
        );

        LocalTime horarioInicial = LocalTime.parse(
                medicamento.getHorario(),
                DateTimeFormatter.ofPattern("HH:mm")
        );

        LocalDate dataInicio = LocalDate.now();
        int dias = medicamento.getDias() != null ? medicamento.getDias() : 1;

        switch (medicamento.getTipoFrequencia()) {

            case "INTERVALO_HORAS" -> {
                int intervalo = medicamento.getValorFrequencia();
                LocalDateTime atual = LocalDateTime.of(dataInicio, horarioInicial);
                LocalDateTime fim = atual.plusDays(dias);

                while (atual.isBefore(fim)) {
                    Alarme alarme = new Alarme();
                    alarme.setHorario(atual);
                    alarme.setTomado(false);
                    alarme.setMedicamento(medicamento);
                    alarme.setUsuario(usuario);
                    alarmes.add(alarme);
                    atual = atual.plusHours(intervalo);
                }
            }

            case "VEZES_DIA" -> {
                int vezes = medicamento.getValorFrequencia();
                int intervalo = 24 / vezes;

                for (int dia = 0; dia < dias; dia++) {
                    LocalDateTime atual = LocalDateTime.of(
                            dataInicio.plusDays(dia), horarioInicial
                    );
                    for (int v = 0; v < vezes; v++) {
                        Alarme alarme = new Alarme();
                        alarme.setHorario(atual.plusHours((long) intervalo * v));
                        alarme.setTomado(false);
                        alarme.setMedicamento(medicamento);
                        alarme.setUsuario(usuario);
                        alarmes.add(alarme);
                    }
                }
            }

            case "DIAS_ESPECIFICOS" -> {
                List<Integer> diasSemana = medicamento.getDiasSemana();

                for (int dia = 0; dia < dias; dia++) {
                    LocalDate data = dataInicio.plusDays(dia);
                    int diaSemana = data.getDayOfWeek().getValue(); // 1=Segunda...7=Domingo

                    if (diasSemana.contains(diaSemana)) {
                        Alarme alarme = new Alarme();
                        alarme.setHorario(LocalDateTime.of(data, horarioInicial));
                        alarme.setTomado(false);
                        alarme.setMedicamento(medicamento);
                        alarme.setUsuario(usuario);
                        alarmes.add(alarme);
                    }
                }
            }
        }

        return repository.saveAll(alarmes);
    }

    // Listar alarmes do usuário
    public List<Alarme> listar(Usuario usuario) {
        return repository.findByUsuario(usuario);
    }

    // Buscar alarme por ID
    public Alarme buscar(Long id, Usuario usuario) {
        Alarme alarme = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alarme não encontrado"));

        if (!alarme.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return alarme;
    }

    // Atualizar horário do alarme
    public Alarme atualizar(Long id, Alarme alarme, Usuario usuario) {
        Alarme existente = buscar(id, usuario);
        existente.setHorario(alarme.getHorario());
        return repository.save(existente);
    }

    // Marcar como tomado
    public Alarme marcarTomado(Long id, Usuario usuario) {
        Alarme existente = buscar(id, usuario);
        existente.setTomado(true);
        return repository.save(existente);
    }

    // Deletar alarmes do medicamento
    public void deletarPorMedicamento(Medicamento medicamento) {
        repository.deleteAll(
                repository.findByMedicamento(medicamento)
        );
    }

    // Deletar alarme
    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario);
        repository.deleteById(id);
    }
}