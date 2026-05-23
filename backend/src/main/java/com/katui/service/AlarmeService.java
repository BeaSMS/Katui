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

    public List<Alarme> gerarAlarmes(Medicamento medicamento, Usuario usuario) {

        List<Alarme> alarmes = new ArrayList<>();

        repository.deleteAll(
                repository.findByMedicamento(medicamento)
        );

        if (medicamento.getHorario() == null || medicamento.getDataInicio() == null) {
            return alarmes;
        }

        LocalTime horarioInicial = LocalTime.parse(
                medicamento.getHorario(),
                DateTimeFormatter.ofPattern("HH:mm")
        );

        LocalDate dataInicio = medicamento.getDataInicio();

        LocalDate dataFim;

        if (medicamento.getDataFim() != null) {
            dataFim = medicamento.getDataFim();
        } else {
            dataFim = dataInicio.plusDays(30);
        }

        switch (medicamento.getTipoFrequencia()) {

            case "DIARIO" -> {

                LocalDate data = dataInicio;

                while (!data.isAfter(dataFim)) {
                    Alarme alarme = criarAlarme(
                            LocalDateTime.of(data, horarioInicial),
                            medicamento,
                            usuario
                    );

                    alarmes.add(alarme);

                    data = data.plusDays(1);
                }
            }

            case "INTERVALO_HORAS" -> {

                Integer intervalo = medicamento.getValorFrequencia();

                if (intervalo == null || intervalo <= 0) {
                    break;
                }

                LocalDateTime atual = LocalDateTime.of(dataInicio, horarioInicial);
                LocalDateTime fim = LocalDateTime.of(dataFim.plusDays(1), LocalTime.MIN);

                while (atual.isBefore(fim)) {
                    Alarme alarme = criarAlarme(
                            atual,
                            medicamento,
                            usuario
                    );

                    alarmes.add(alarme);

                    atual = atual.plusHours(intervalo);
                }
            }

            case "SEMANAL" -> {

                LocalDate data = dataInicio;

                while (!data.isAfter(dataFim)) {
                    Alarme alarme = criarAlarme(
                            LocalDateTime.of(data, horarioInicial),
                            medicamento,
                            usuario
                    );

                    alarmes.add(alarme);

                    data = data.plusWeeks(1);
                }
            }

            case "MENSAL" -> {

                LocalDate data = dataInicio;

                while (!data.isAfter(dataFim)) {
                    Alarme alarme = criarAlarme(
                            LocalDateTime.of(data, horarioInicial),
                            medicamento,
                            usuario
                    );

                    alarmes.add(alarme);

                    data = data.plusMonths(1);
                }
            }
        }

        return repository.saveAll(alarmes);
    }

    private Alarme criarAlarme(
            LocalDateTime horario,
            Medicamento medicamento,
            Usuario usuario
    ) {
        Alarme alarme = new Alarme();
        alarme.setHorario(horario);
        alarme.setTomado(false);
        alarme.setMedicamento(medicamento);
        alarme.setUsuario(usuario);
        return alarme;
    }

    public List<Alarme> listar(Usuario usuario) {
        return repository.findByUsuarioAndMedicamentoAtivoTrue(usuario);
    }

    public Alarme buscar(Long id, Usuario usuario) {
        Alarme alarme = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alarme não encontrado"));

        if (!alarme.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return alarme;
    }

    public Alarme atualizar(Long id, Alarme alarme, Usuario usuario) {
        Alarme existente = buscar(id, usuario);
        existente.setHorario(alarme.getHorario());
        return repository.save(existente);
    }

    public Alarme marcarTomado(Long id, Usuario usuario) {
        Alarme existente = buscar(id, usuario);
        existente.setTomado(true);
        return repository.save(existente);
    }

    public void deletarPorMedicamento(Medicamento medicamento) {
        repository.deleteByMedicamentoIdAndUsuarioId(
                medicamento.getId(),
                medicamento.getUsuario().getId()
        );
    }

    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario);
        repository.deleteById(id);
    }
}