package com.harsh.KaamKaaj.task.dto;

import com.harsh.KaamKaaj.task.TaskPriority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(min = 2, max = 200, message = "Title must be 2-200 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private TaskPriority priority = TaskPriority.MEDIUM;

    // @FutureOrPresent ensures the due date isn't in the past.
    // null is allowed — not every task needs a due date.
    @FutureOrPresent(message = "Due date cannot be in the past")
    private LocalDate dueDate;
}