package com.harsh.KaamKaaj.task.dto;

import com.harsh.KaamKaaj.task.TaskPriority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

// All fields are optional — only non-null fields are applied.
// This is a partial update pattern. We don't use @NotBlank
// here because the user might only want to change the priority
// without touching the title.
//
// Note: TaskStatus is NOT here. Users update status via a
// separate endpoint. Admins cannot update status at all.
@Getter
@Setter
public class UpdateTaskRequest {

    @Size(min = 2, max = 200, message = "Title must be 2-200 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private TaskPriority priority;

    @FutureOrPresent(message = "Due date cannot be in the past")
    private LocalDate dueDate;
}